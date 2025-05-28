const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的电视</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .page-bg {
            background: #000;
            min-height: 100vh;
            background-image: 
                radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%),
                radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.2) 2%, transparent 0%);
            background-size: 100px 100px;
        }
        .card-hover {
            transition: all 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .card-hover:hover {
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
        }
        .gradient-text {
            background: linear-gradient(to right, #fff, #999);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .settings-panel {
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        .settings-panel.show {
            transform: translateX(0);
        }
        
        /* 自定义滚动条样式 */
        ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: #111;
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: #333;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: #444;
        }
        
        /* Firefox 滚动条样式 */
        * {
            scrollbar-width: thin;
            scrollbar-color: #333 #111;
        }
    </style>
</head>
<body class="page-bg text-white">
    <div class="fixed top-4 right-4 z-50 flex items-center space-x-4">
        <button onclick="toggleSettings(event)" class="bg-[#222] hover:bg-[#333] border border-[#333] hover:border-white rounded-lg px-4 py-2 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
        </button>
    </div>

    <!-- 设置面板 -->
    <div id="settingsPanel" class="settings-panel fixed right-0 top-0 h-full w-80 bg-[#111] border-l border-[#333] p-6 z-40">
        <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold gradient-text">设置</h3>
            <button onclick="toggleSettings()" class="text-gray-400 hover:text-white">&times;</button>
        </div>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-400 mb-2">选择采集站点</label>
                <select id="apiSource" class="w-full bg-[#222] border border-[#333] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-white transition-colors">
                    <option value="heimuer">黑莓影视 (heimuer)</option>
                    <option value="aiqiyi">爱奇艺 (aiqiyi)</option>jkunzy
                    <option value="jkunzy">jkun资源 (jkunzy)</option>
                    <option value="baiwan">百万资源 (baiwan)</option>
                    <option value="custom">自定义接口</option>
                </select>
            </div>
            
            <!-- 添加自定义接口输入框 -->
            <div id="customApiInput" class="hidden">
                <label class="block text-sm font-medium text-gray-400 mb-2">自定义接口地址</label>
                <input 
                    type="text" 
                    id="customApiUrl" 
                    class="w-full bg-[#222] border border-[#333] text-white px-3 py-2 rounded-lg focus:outline-none focus:border-white transition-colors"
                    placeholder="支持格式：https://example.com 或 https://example.com/api.php/provide/vod"
                >
                <p class="text-xs text-gray-500 mt-1">
                    支持多种格式：<br>
                    • 域名：https://tyyszy.com<br>
                    • 完整路径：https://tyyszy.com/api.php/provide/vod
                </p>
            </div>
            
            <div class="mt-4">
                <p class="text-xs text-gray-500">当前站点代码：
                    <span id="currentCode" class="text-white"></span>
                    <span id="siteStatus" class="ml-2"></span>
                </p>
            </div>
        </div>
    </div>

    <div class="container mx-auto px-4 py-8 flex flex-col h-screen">
        <div class="flex-1 flex flex-col">
            <!-- 搜索区域：默认居中 -->
            <div id="searchArea" class="flex-1 flex flex-col items-center justify-center">
                <h1 class="text-5xl font-bold gradient-text mb-12">视频搜索</h1>
                <div class="w-full max-w-2xl">
                    <div class="flex">
                        <input type="text" 
                               id="searchInput" 
                               class="w-full bg-[#111] border border-[#333] text-white px-6 py-4 rounded-l-lg focus:outline-none focus:border-white transition-colors" 
                               placeholder="搜索你喜欢的视频...">
                        <button onclick="search()" 
                                class="px-8 py-4 bg-white text-black font-medium rounded-r-lg hover:bg-gray-200 transition-colors">
                            搜索
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 搜索结果：初始隐藏 -->
            <div id="resultsArea" class="w-full hidden">
                <!-- 添加搜索结果信息 -->
                <div id="searchInfo" class="mb-4 text-center">
                    <p class="text-gray-400 text-sm">
                        <span id="resultCount">0</span> 个结果 - 第 <span id="currentPageNum">1</span> 页
                    </p>
                </div>
                <div id="results" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                </div>
            </div>
        </div>
    </div>

    <!-- 详情模态框 -->
    <div id="modal" class="fixed inset-0 bg-black/95 hidden flex items-center justify-center">
        <div class="bg-[#111] p-8 rounded-lg w-11/12 max-w-4xl border border-[#333] max-h-[90vh] flex flex-col">
            <div class="flex justify-between items-center mb-6 flex-none">
                <h2 id="modalTitle" class="text-2xl font-bold gradient-text"></h2>
                <button onclick="closeModal()" class="text-gray-400 hover:text-white text-2xl transition-colors">&times;</button>
            </div>
            <div id="modalContent" class="overflow-auto flex-1 min-h-0">
                <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                </div>
            </div>
        </div>
    </div>

    <!-- 错误提示框 -->
    <div id="toast" class="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 opacity-0 -translate-y-full">
        <p id="toastMessage"></p>
    </div>

    <!-- 添加 loading 提示框 -->
    <div id="loading" class="fixed inset-0 bg-black/80 hidden items-center justify-center z-50">
        <div class="bg-[#111] p-8 rounded-lg border border-[#333] flex items-center space-x-4">
            <div class="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p class="text-white text-lg">加载中...</p>
        </div>
    </div>

    <script>
        let currentApiSource = localStorage.getItem('currentApiSource') || 'heimuer';
        let customApiUrl = localStorage.getItem('customApiUrl') || '';

        // 初始化时检查是否使用自定义接口
        if (currentApiSource === 'custom') {
            document.getElementById('customApiInput').classList.remove('hidden');
            document.getElementById('customApiUrl').value = customApiUrl;
        }

        // 设置 select 的默认选中值
        document.getElementById('apiSource').value = currentApiSource;

        // 添加分页相关变量
        let currentPage = 1;
        let isLoading = false;
        let hasMore = true;
        let currentQuery = '';
        let totalResults = 0; // 添加总结果计数

        function toggleSettings(e) {
            // 阻止事件冒泡，防止触发document的点击事件
            e && e.stopPropagation();
            const panel = document.getElementById('settingsPanel');
            panel.classList.toggle('show');
        }

        async function testSiteAvailability(source) {
            try {
                const apiParams = source === 'custom' 
                    ? '&customApi=' + encodeURIComponent(customApiUrl)
                    : '&source=' + source;
                    
                const response = await fetch('/api/search?wd=test' + apiParams);
                const data = await response.json();
                return data.code !== 400;
            } catch (error) {
                return false;
            }
        }

        function updateSiteStatus(isAvailable) {
            const statusEl = document.getElementById('siteStatus');
            if (isAvailable) {
                statusEl.innerHTML = '<span class="text-green-500">●</span> 可用';
            } else {
                statusEl.innerHTML = '<span class="text-red-500">●</span> 不可用';
            }
        }

        document.getElementById('apiSource').addEventListener('change', async function(e) {
            currentApiSource = e.target.value;
            const customApiInput = document.getElementById('customApiInput');
            
            if (currentApiSource === 'custom') {
                customApiInput.classList.remove('hidden');
                customApiUrl = document.getElementById('customApiUrl').value;
                localStorage.setItem('customApiUrl', customApiUrl);
                // 自定义接口不立即测试可用性
                document.getElementById('siteStatus').innerHTML = '<span class="text-gray-500">●</span> 待测试';
            } else {
                customApiInput.classList.add('hidden');
                // 非自定义接口立即测试可用性
                showToast('正在测试站点可用性...', 'info');
                const isAvailable = await testSiteAvailability(currentApiSource);
                updateSiteStatus(isAvailable);
                
                if (!isAvailable) {
                    showToast('当前站点不可用，请尝试其他站点', 'error');
                } else {
                    showToast('站点可用', 'success');
                }
            }
            
            localStorage.setItem('currentApiSource', currentApiSource);
            document.getElementById('currentCode').textContent = currentApiSource;
            
            // 清理搜索结果
            document.getElementById('results').innerHTML = '';
            document.getElementById('searchInput').value = '';
            
            // 重置分页状态
            currentPage = 1;
            totalResults = 0;
            hasMore = true;
            
            // 隐藏结果区域
            document.getElementById('resultsArea').classList.add('hidden');
            document.getElementById('searchArea').classList.add('flex-1');
            document.getElementById('searchArea').classList.remove('mb-8');
        });

        // 修改自定义接口输入框的事件监听
        document.getElementById('customApiUrl').addEventListener('blur', async function(e) {
            customApiUrl = e.target.value;
            localStorage.setItem('customApiUrl', customApiUrl);
            
            if (currentApiSource === 'custom' && customApiUrl) {
                showToast('正在测试接口可用性...', 'info');
                const isAvailable = await testSiteAvailability('custom');
                updateSiteStatus(isAvailable);
                
                if (!isAvailable) {
                    showToast('接口不可用，请检查地址是否正确', 'error');
                } else {
                    showToast('接口可用', 'success');
                }
            }
        });

        // 初始化显示当前站点代码和状态
        document.getElementById('currentCode').textContent = currentApiSource;
        testSiteAvailability(currentApiSource).then(updateSiteStatus);

        function showToast(message, type = 'error') {
            const toast = document.getElementById('toast');
            const toastMessage = document.getElementById('toastMessage');
            
            const bgColors = {
                'error': 'bg-red-500',
                'success': 'bg-green-500',
                'info': 'bg-blue-500'
            };
            
            const bgColor = bgColors[type] || bgColors.error;
            toast.className = \`fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 \${bgColor} text-white\`;
            toastMessage.textContent = message;
            
            // 显示提示
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
            
            // 3秒后自动隐藏
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(-100%)';
            }, 3000);
        }

        // 添加显示/隐藏 loading 的函数
        function showLoading() {
            const loading = document.getElementById('loading');
            loading.style.display = 'flex';
        }

        function hideLoading() {
            const loading = document.getElementById('loading');
            loading.style.display = 'none';
        }

        async function search(page = 1, append = false) {
            if (isLoading) return;
            
            showLoading();
            isLoading = true;
            
            const query = document.getElementById('searchInput').value;
            if (!append) {
                currentQuery = query;
                currentPage = 1;
                hasMore = true;
            }
            
            const apiParams = currentApiSource === 'custom' 
                ? '&customApi=' + encodeURIComponent(customApiUrl)
                : '&source=' + currentApiSource;
            
            // 添加分页参数
            const pageParam = '&pg=' + page;
            
            try {
                const response = await fetch('/api/search?wd=' + encodeURIComponent(query) + apiParams + pageParam);
                const data = await response.json();
                
                if (data.code === 400) {
                    showToast(data.msg);
                    return;
                }
                
                // 显示结果区域，调整搜索区域
                document.getElementById('searchArea').classList.remove('flex-1');
                document.getElementById('searchArea').classList.add('mb-8');
                document.getElementById('resultsArea').classList.remove('hidden');
                
                const resultsDiv = document.getElementById('results');
                const newResults = data.list.map(item => \`
                    <div class="card-hover bg-[#111] rounded-lg overflow-hidden cursor-pointer p-6 h-fit" onclick="showDetails('\${item.vod_id}','\${item.vod_name}')">
                        <h3 class="text-xl font-semibold mb-3">\${item.vod_name}</h3>
                        <p class="text-gray-400 text-sm mb-2">\${item.type_name}</p>
                        <p class="text-gray-400 text-sm">\${item.vod_remarks}</p>
                    </div>
                \`).join('');
                
                if (append) {
                    resultsDiv.innerHTML += newResults;
                    totalResults += data.list.length;
                } else {
                    resultsDiv.innerHTML = newResults;
                    totalResults = data.list.length;
                }
                
                // 更新结果计数显示
                document.getElementById('resultCount').textContent = totalResults;
                document.getElementById('currentPageNum').textContent = page;
                
                // 检查是否还有更多数据
                hasMore = data.list && data.list.length > 0;
                
                // 更新或添加加载更多按钮
                updateLoadMoreButton();
                
            } catch (error) {
                showToast('搜索请求失败，请稍后重试');
            } finally {
                hideLoading();
                isLoading = false;
            }
        }

        // 加载更多结果
        async function loadMore() {
            if (!hasMore || isLoading) return;
            
            currentPage++;
            await search(currentPage, true);
        }

        // 更新加载更多按钮
        function updateLoadMoreButton() {
            let loadMoreBtn = document.getElementById('loadMoreBtn');
            const resultsArea = document.getElementById('resultsArea');
            
            if (!loadMoreBtn) {
                loadMoreBtn = document.createElement('div');
                loadMoreBtn.id = 'loadMoreBtn';
                loadMoreBtn.className = 'text-center mt-8';
                resultsArea.appendChild(loadMoreBtn);
            }
            
            if (hasMore) {
                loadMoreBtn.innerHTML = \`
                    <button onclick="loadMore()" class="px-6 py-3 bg-[#222] hover:bg-[#333] border border-[#333] hover:border-white rounded-lg transition-colors">
                        加载更多
                    </button>
                \`;
            } else {
                loadMoreBtn.innerHTML = \`
                    <p class="text-gray-500 text-sm">已显示全部结果</p>
                \`;
            }
        }

        async function showDetails(id,vod_name) {
            showLoading();
            try {
                const apiParams = currentApiSource === 'custom' 
                    ? '&customApi=' + encodeURIComponent(customApiUrl)
                    : '&source=' + currentApiSource;
                    
                const response = await fetch('/api/detail?id=' + id + apiParams);
                const data = await response.json();
                
                console.log('获取到的详情数据:', data);
                
                // 检查是否获取到有效的集数数据
                if (!data.episodes || data.episodes.length === 0) {
                    showToast('未找到可播放的视频链接，请尝试其他资源站点');
                    hideLoading();
                    return;
                }
                
                const modal = document.getElementById('modal');
                const modalTitle = document.getElementById('modalTitle');
                const modalContent = document.getElementById('modalContent');
                
                modalTitle.textContent = vod_name + ' - 共' + data.episodes.length + '集';
                modalContent.innerHTML = \`
                    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        \${data.episodes.map((episode, index) => {
                            // 检查episode是否是对象格式（新格式）还是字符串格式（旧格式）
                            const isNewFormat = typeof episode === 'object' && episode.title && episode.url;
                            const episodeTitle = isNewFormat ? episode.title : \`第\${index + 1}集\`;
                            const episodeUrl = isNewFormat ? episode.url : episode;
                            
                            // 验证URL是否有效
                            if (!episodeUrl || episodeUrl.length < 10) {
                                console.warn('无效的视频URL:', episodeUrl);
                                return '';
                            }
                            
                            return \`
                                <button onclick="playVideo('\${episodeUrl}','\${vod_name}','\${episodeTitle}')" 
                                        class="px-4 py-2 bg-[#222] hover:bg-[#333] border border-[#333] hover:border-white rounded-lg transition-colors text-center">
                                    \${episodeTitle}
                                </button>
                            \`;
                        }).filter(btn => btn !== '').join('')}
                    </div>
                \`;
                
                modal.classList.remove('hidden');
            } catch (error) {
                console.error('获取详情时出错:', error);
                showToast('获取详情失败，请稍后重试');
            } finally {
                hideLoading();
            }
        }

        function closeModal() {
            document.getElementById('modal').classList.add('hidden');
            // 清除 iframe 内容
            document.getElementById('modalContent').innerHTML = '';
        }

        function playVideo(url,vod_name, episodeTitle) {
            showLoading();
            const modalContent = document.getElementById('modalContent');
            const currentTitle = modalTitle.textContent.split(' - ')[0];
            const currentHtml = modalContent.innerHTML;
            
            // 更新标题显示，使用传入的集数标题
            modalTitle.textContent = vod_name + " - " + (episodeTitle || event.target.textContent);
            
            // 先移除现有的视频播放器（如果存在）
            const existingPlayer = modalContent.querySelector('.video-player');
            if (existingPlayer) {
                existingPlayer.remove();
            }
            
            // 如果是第一次播放，保存集数列表
            if (!modalContent.querySelector('.episodes-list')) {
                modalContent.innerHTML = \`
                    <div class="space-y-6">
                        <div class="video-player">
                            <iframe 
                                src="https://hoplayer.com/index.html?url=\${url}&autoplay=true"
                                width="100%" 
                                height="600" 
                                frameborder="0" 
                                scrolling="no" 
                                allowfullscreen="true"
                                onload="hideLoading()">
                            </iframe>
                        </div>
                        <div class="episodes-list mt-6">
                            \${currentHtml}
                        </div>
                    </div>
                \`;
            } else {
                // 如果已经有集数列表，只更新视频播放器
                const episodesList = modalContent.querySelector('.episodes-list');
                modalContent.innerHTML = \`
                    <div class="space-y-6">
                        <div class="video-player">
                            <iframe 
                                src="https://hoplayer.com/index.html?url=\${url}&autoplay=true"
                                width="100%" 
                                height="600" 
                                frameborder="0" 
                                scrolling="no" 
                                allowfullscreen="true"
                                onload="hideLoading()">
                            </iframe>
                        </div>
                        <div class="episodes-list mt-6">
                            \${episodesList.innerHTML}
                        </div>
                    </div>
                \`;
            }
        }

        // 点击外部关闭设置面板
        document.addEventListener('click', function(e) {
            const panel = document.getElementById('settingsPanel');
            const settingsButton = document.querySelector('button[onclick="toggleSettings()"]');
            
            if (!panel.contains(e.target) && !settingsButton.contains(e.target) && panel.classList.contains('show')) {
                panel.classList.remove('show');
            }
        });

        // 回车搜索
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                search();
            }
        });
    </script>
</body>
</html>
`;

const API_SITES = {
    heimuer: {
        api: 'https://json.heimuer.xyz',
        name: '黑木耳',
        detail: 'https://heimuer.tv',
    },

    aiqiyi: {
        api: 'https://iqiyizyapi.com',
        name: '爱奇艺',
        detail: 'https://iqiyizyapi.com',
    },

    jkunzy: {
        api: 'https://jkunzyapi.com',
        name: 'jkun资源',
        detail: 'https://jkunzyapi.com',
    },

    baiwan: {
        api: 'https://api.bwzym3u8.com',
        name: '百万资源',
        detail: 'https://api.bwzym3u8.com',
    },
};

async function handleRequest(request) {
    const url = new URL(request.url);
    const customApi = url.searchParams.get('customApi') || '';
    
    // 处理自定义API URL的函数
    function normalizeCustomApiUrl(apiUrl) {
        if (!apiUrl) return '';
        
        // 确保URL以http://或https://开头
        if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
            apiUrl = 'https://' + apiUrl;
        }
        
        // 如果只是域名，添加标准API路径
        if (!apiUrl.includes('/api.php/provide/vod')) {
            apiUrl = apiUrl.replace(/\/$/, '') + '/api.php/provide/vod/';
        }
        
        return apiUrl;
    }
    
    // 从自定义API URL提取基础域名的函数
    function extractBaseUrlFromCustomApi(apiUrl) {
        if (!apiUrl) return '';
        
        // 如果是完整的API路径，提取基础域名
        if (apiUrl.includes('/api.php/provide/vod')) {
            return apiUrl.split('/api.php/provide/vod')[0];
        }
        
        // 确保URL格式正确
        if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
            apiUrl = 'https://' + apiUrl;
        }
        
        // 移除末尾的斜杠
        return apiUrl.replace(/\/$/, '');
    }
    
    // API 路由处理
    if (url.pathname === '/api/search') {
        const searchQuery = url.searchParams.get('wd');
        const source = url.searchParams.get('source') || 'heimuer';
        const page = url.searchParams.get('pg') || '1'; // 获取页码参数

        try {
            let apiUrl;
            if (customApi) {
                // 自定义API，标准化URL并添加参数
                apiUrl = normalizeCustomApiUrl(customApi);
                
                // 构建完整的API URL
                apiUrl += '?ac=list';
                
                // 添加搜索参数
                if (searchQuery) {
                    apiUrl += '&wd=' + encodeURIComponent(searchQuery);
                }
                
                // 添加分页参数
                apiUrl += '&pg=' + page;
            } else {
                // 标准API站点
                apiUrl = API_SITES[source].api + '/api.php/provide/vod/?ac=list&wd=' + encodeURIComponent(searchQuery) + '&pg=' + page;
            }
            
            const response = await fetch(apiUrl, {
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                    Accept: 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('API 请求失败');
            }
            const data = await response.text();
            return new Response(data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        } catch (error) {
            return new Response(
                JSON.stringify({
                    code: 400,
                    msg: '搜索服务暂时不可用，请稍后再试',
                    list: [],
                }),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                },
            );
        }
    }

    if (url.pathname === '/api/detail') {
        const id = url.searchParams.get('id');
        const source = url.searchParams.get('source') || 'heimuer';
        const customApi = url.searchParams.get('customApi') || '';
        
        let detailUrl;
        
        if (customApi) {
            // 处理自定义接口
            const baseUrl = extractBaseUrlFromCustomApi(customApi);
            detailUrl = `https://r.jina.ai/${baseUrl}/index.php/vod/detail/id/${id}.html`;
        } else {
            // 使用预定义的API站点
            detailUrl = `https://r.jina.ai/${API_SITES[source].detail}/index.php/vod/detail/id/${id}.html`;
        }
        
        const response = await fetch(detailUrl);
        const html = await response.text();

        // 更新正则表达式以匹配新的 URL 格式
        let matches = [];
        let episodeInfo = [];
        
        // 添加调试信息
        console.log('获取详情页面URL:', detailUrl);
        console.log('HTML长度:', html.length);
        
        if (source === 'ffzy') {
            matches = html.match(/(?<=\$)(https?:\/\/[^"'\s]+?\/\d{8}\/\d+_[a-f0-9]+\/index\.m3u8)/g) || [];
            matches = matches.map(link => link.split('(')[1]);
        } else {
            // 匹配多种格式的播放链接
            
            // 1. 匹配$分隔的链接格式（有标题/集数信息）
            // 优化正则表达式，确保提取完整的URL
            const dollarMatches = html.match(/(.*?)\$(https?:\/\/.*?\.(m3u8|mp4|flv|avi|mkv))/gi) || [];
            
            // 2. 匹配纯URL格式（没有前缀，直接是https链接）
            // 更宽松的URL匹配，包括可能的MP4等格式
            const allUrls = html.match(/https?:\/\/[^\s"'<>\n\r$]+?\.(m3u8|mp4|flv|avi|mkv)/gi) || [];
            
            // 3. 尝试匹配更多可能的格式
            const playUrlMatches = html.match(/play_url['"]*[:=]['"]*([^'"]+)/gi) || [];
            const srcMatches = html.match(/src['"]*[:=]['"]*([^'"]+\.(m3u8|mp4))/gi) || [];
            
            console.log('$分隔链接数量:', dollarMatches.length);
            console.log('纯URL数量:', allUrls.length);
            console.log('play_url匹配数量:', playUrlMatches.length);
            console.log('src匹配数量:', srcMatches.length);
            
            // 添加示例输出
            if (dollarMatches.length > 0) {
                console.log('$分隔链接示例:', dollarMatches[0]);
            }
            if (allUrls.length > 0) {
                console.log('纯URL示例:', allUrls[0]);
            }
            
            const dollarUrls = dollarMatches.map(match => {
                const matchResult = match.match(/(.*?)\$(https?:\/\/.*?\.(m3u8|mp4|flv|avi|mkv))/i);
                return matchResult ? matchResult[2] : null;
            }).filter(url => url);
            const pureUrls = allUrls.filter(url => !dollarUrls.includes(url));
            
            // 处理$分隔的链接
            dollarMatches.forEach(match => {
                const matchResult = match.match(/(.*?)\$(https?:\/\/.*?\.(m3u8|mp4|flv|avi|mkv))/i);
                if (!matchResult) return;
                
                const [, title, url] = matchResult;
                
                // 清理标题中的无关字符
                let cleanTitle = title.trim();
                
                // 移除常见的错误前缀字符和符号
                cleanTitle = cleanTitle.replace(/^[\*\-\s\[\]xX✓✗×√]+/, ''); // 移除开头的各种符号
                cleanTitle = cleanTitle.replace(/^[\s\-\|\·•→←↑↓]+/, ''); // 移除开头的空格、横线、分隔符等
                cleanTitle = cleanTitle.replace(/^\([^)]*\)/, ''); // 移除开头的括号内容
                cleanTitle = cleanTitle.replace(/^【[^】]*】/, ''); // 移除开头的中文括号内容
                cleanTitle = cleanTitle.trim(); // 再次清理空格
                
                // 如果清理后标题为空或太短，使用默认格式
                if (!cleanTitle || cleanTitle.length < 2) {
                    cleanTitle = `第${dollarMatches.indexOf(match) + 1}集`;
                }
                
                // 尝试从标题中提取集数
                const episodeMatch = cleanTitle.match(/第(\d+)集|EP(\d+)|episode\s*(\d+)/i);
                let episodeNumber = null;
                
                if (episodeMatch) {
                    episodeNumber = episodeMatch[1] || episodeMatch[2] || episodeMatch[3];
                }
                
                episodeInfo.push({
                    title: cleanTitle,
                    url: url,
                    episodeNumber: episodeNumber
                });
            });
            
            // 处理纯URL格式，自动编号
            pureUrls.forEach((url, index) => {
                episodeInfo.push({
                    title: `第${index + 1}集`,
                    url: url,
                    episodeNumber: (index + 1).toString()
                });
            });
            
            // 合并所有链接
            matches = [...pureUrls, ...episodeInfo.filter(item => !pureUrls.includes(item.url)).map(item => item.url)];
            
            // 对于没有明确集数的$分隔链接，按顺序编号
            let autoEpisodeCounter = pureUrls.length + 1; // 从纯URL数量+1开始编号
            episodeInfo.forEach(item => {
                if (!item.episodeNumber && !pureUrls.includes(item.url)) {
                    // 检查是否已经有相同编号
                    while (episodeInfo.some(ep => ep.episodeNumber === autoEpisodeCounter.toString())) {
                        autoEpisodeCounter++;
                    }
                    item.episodeNumber = autoEpisodeCounter.toString();
                    item.title = `第${autoEpisodeCounter}集`;
                    autoEpisodeCounter++;
                }
            });
            
            // 按集数排序
            episodeInfo.sort((a, b) => {
                const numA = parseInt(a.episodeNumber) || 0;
                const numB = parseInt(b.episodeNumber) || 0;
                return numA - numB;
            });
            
            // 如果没有找到任何链接，尝试原来的匹配方式作为备用
            if (matches.length === 0) {
                // 备用匹配1: 尝试匹配所有可能的视频URL
                const fallbackUrls = html.match(/https?:\/\/[^"'\s<>]+?\.(m3u8|mp4|flv|avi|mkv)/gi) || [];
                
                // 备用匹配2: 尝试匹配特定模式
                const specificMatches = html.match(/\$https?:\/\/[^"'\s]+?\.(m3u8|mp4)/gi) || [];
                
                // 备用匹配3: 在JavaScript代码中查找URL
                const jsUrls = html.match(/['"](https?:\/\/[^'"]+?\.(m3u8|mp4))['"]/gi) || [];
                
                console.log('备用匹配 - fallbackUrls:', fallbackUrls.length);
                console.log('备用匹配 - specificMatches:', specificMatches.length);
                console.log('备用匹配 - jsUrls:', jsUrls.length);
                
                // 合并所有备用匹配的结果
                const allFallbackUrls = [
                    ...fallbackUrls,
                    ...specificMatches.map(link => link.substring(1)), // 移除开头的 $
                    ...jsUrls.map(match => match.replace(/['"]/g, '')) // 移除引号
                ];
                
                // 去重
                matches = [...new Set(allFallbackUrls)];
                
                console.log('最终获取到的URL数量:', matches.length);
                if (matches.length > 0) {
                    console.log('第一个URL示例:', matches[0]);
                }
            }
        }

        return new Response(
            JSON.stringify({
                episodes: episodeInfo.length > 0 ? episodeInfo : matches.map((url, index) => ({
                    title: `第${index + 1}集`,
                    url: url,
                    episodeNumber: (index + 1).toString()
                })),
                detailUrl: detailUrl,
                debug: {
                    totalEpisodes: episodeInfo.length > 0 ? episodeInfo.length : matches.length,
                    hasEpisodes: (episodeInfo.length > 0 ? episodeInfo.length : matches.length) > 0,
                    source: source,
                    customApi: customApi ? 'yes' : 'no'
                }
            }),
            {
                headers: { 'Content-Type': 'application/json' },
            },
        );
    }

    // 默认返回 HTML 页面
    return new Response(HTML_TEMPLATE, {
        headers: { 'Content-Type': 'text/html' },
    });
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});
