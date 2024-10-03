// 显示公告
function showToast() {
    const message = `
            <div>
                <p><strong>API CHECKER v1.4</strong></p>
                <br>
                <div>仓库地址:  <a href="https://github.com/QAbot-zh/query-key" target="_blank" style="color: #1e88e5">QAbot-zh/query-key</a></div><div>点点star 可以自行部署</div>
                <br>
                <p><strong>如何使用 :</strong></p>
                <ul>
                    <div>📝 在表单中输入你的API URL和APIKey</div>
                    <div>🔍 选择名称或输入您想要测试的模型</div>
                    <div>🖱️ 测试全在本地进行</div>
                    <div>🎉 等待结果并查看详细报告</div>
                    <div>🕵️ 使用“官转验证”功能确认API的真实性</div>
                    <div>🕵️‍♀️ 使用“温度验证”功能确认API的真实性</div>
                    <div>📊 使用“函数验证”功能检测API是否支持FC</div>
                    <div>🔒 <strong> beta 功能：支持本地缓存API信息，数据仅本地保留，默认关闭</strong> </div>
                </ul>
                <br>
                <p><strong>版本历史:</strong></p>
                 <div><a href="https://linux.do/t/topic/199694" target="_blank" style="color: #1e88e5">v1.4版本介绍</a></div>
                 <div><a href="https://linux.do/t/topic/191420" target="_blank" style="color: #1e88e5">v1.3版本介绍</a></div>
                 <div><a href="https://linux.do/t/topic/190955" target="_blank" style="color: #1e88e5">v1.2版本介绍</a></div>
                 <div><a href="https://linux.do/t/topic/196537" target="_blank" style="color: #1e88e5">beta功能</a></div>
                 <br>
                <p><strong>Tips:</strong></p>
                <div>🌱GPT系列，才有官转验证，系统判断仅供参考，原理请看 <a href="https://linux.do/t/topic/191420" target="_blank" style="color: #1e88e5">v1.3版本介绍</a></div>
                <div>🌡️ 温度验证：低温度参数下，大模型回复的稳定性。测试结果仅供参考，原理请看 <a href="https://linux.do/t/topic/195972" target="_blank" style="color: #1e88e5">温度验证</a></div>
            </div>
        `;
    const toast = document.createElement('div');
    toast.class = 'toast';
    toast.innerHTML = `${message}
                           <button onclick="this.parentElement.style.display='none';" aria-label="close">
                               <svg aria-hidden="true" viewBox="0 0 14 16" width="14" height="16">
                                   <path fill-rule="evenodd" d="M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"></path>
                               </svg>
                           </button>`;
    document.body.appendChild(toast);
}

// showToast();
// 智能提取API信息
document.getElementById('api_info').addEventListener('input', function () {
    let text = this.value;
    let urlPattern = /(https?:\/\/[^\s，。、！,；;\n]+)/;
    let keyPattern = /(sk-[a-zA-Z0-9]+)/;

    let urlMatch = text.match(urlPattern);
    let keyMatch = text.match(keyPattern);

    if (urlMatch) {
        //去除末尾/后的空格 其他字符 保留到最后一个/前面
        let cleanUrl = urlMatch[0].match(/(.*)\/.*/)[1];
        //如果. 存在则使用
        if (cleanUrl.includes('.')) {
            document.getElementById('api_url').value = cleanUrl;
            console.log(cleanUrl);
        } else {
            document.getElementById('api_url').value = urlMatch[0];
            console.log(urlMatch[0]);
        }
    }
    if (keyMatch) {
        document.getElementById('api_key').value = keyMatch[0];
    }
});

function getModelList() {
    const apiUrl = document.getElementById('api_url').value.replace(/\/+$/, '');
    const apiKey = document.getElementById('api_key').value;
    console.log(apiUrl, apiKey);

    layui.use('layer', function () {
        let layer = layui.layer;

        layer.load();
        fetch(`${apiUrl}/v1/models`, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(data => {
                layer.closeAll('loading');
                const models = data.data.map(model => model.id);
                models.sort();
                displayModelCheckboxes(models);
            })
            .catch(error => {
                layer.closeAll('loading');
                layer.alert('获取模型列表失败: ' + error.message);
            });
    });
}

// 显示模型复选框
function displayModelCheckboxes(models) {
    layui.use(['layer', 'form'], function () {
        let layer = layui.layer;
        let form = layui.form;

        let content = '<div css="padding: 20px;"><form class="layui-form">';
        content += '<div id="selectedCount">已选择 0 个模型</div>';
        content += `
                <div class="model-filter-container">
                    <input type="text" id="prefixFilter" placeholder="输入模型前缀筛选">
                    <button type="button" onclick="filterModels()">筛选</button>
                    <button type="button" class="clear" onclick="clearFilter()">清空</button>
                </div>
                <div class="checkbox-container">
                    <label><input type="checkbox" lay-skin="primary" lay-filter="checkAll" title="全选"></label>
                    <label><input type="checkbox" lay-skin="primary" lay-filter="checkAllChatOnly" title="全选（过滤音/图/视/嵌入模型）"></label>
                </div>
            `;
        content += '<div id="modelList">';
        models.forEach((model, index) => {
            content += `
                    <div class="layui-form-item model-item" data-model="${model}">
                        <input type="checkbox" name="models[${index}]" value="${model}" title="${model}" lay-skin="primary">
                    </div>
                `;
        });
        content += '</div></form></div>';

        layer.open({
            type: 1,
            title: '选择模型',
            content: content,
            area: ['400px', '550px'],
            btn: ['确定', '取消'],
            success: function (layero, index) {
                form.render('checkbox');
                setupEventListeners(layero, form);
            },
            yes: function (index, layero) {
                const selectedModels = layero.find('input[name^="models"]:checked').map(function () {
                    return this.value;
                }).get();
                document.getElementById('model_name').value = selectedModels.join(',');
                layer.close(index);
            }
        });
    });
}

function setupEventListeners(layero, form) {
    form.on('checkbox', function (data) {
        updateSelectedCount(layero);
    });

    form.on('checkbox(checkAll)', function (data) {
        let child = layero.find('input[name^="models"]');
        child.each(function (index, item) {
            item.checked = data.elem.checked;
        });
        form.render('checkbox');
        updateSelectedCount(layero);
        layero.find('input[lay-filter="checkAllChatOnly"]').prop('checked', false);
    });

    form.on('checkbox(checkAllChatOnly)', function (data) {
        const child = layero.find('input[name^="models"]');
        const notChatPattern = /^(dall|mj|midjourney|stable-diffusion|playground|flux|swap_face|tts|whisper|text|emb|luma|vidu|pdf|suno|pika|chirp|domo|runway|cogvideo)/;
        child.each(function (index, item) {
            const modelName = item.value;
            item.checked = data.elem.checked && !notChatPattern.test(modelName) && !/(image|audio|video|music|pdf|flux|suno|embed)/.test(modelName);
        });
        form.render('checkbox');
        updateSelectedCount(layero);
        layero.find('input[lay-filter="checkAll"]').prop('checked', false);
    });
}

function filterModels() {
    const prefix = document.getElementById('prefixFilter').value.trim().toLowerCase();
    const modelItems = document.querySelectorAll('.model-item');
    const modelList = document.getElementById('modelList');

    const matchedModels = [];
    const unmatchedModels = [];

    modelItems.forEach(item => {
        const model = item.getAttribute('data-model').toLowerCase();
        if (model.startsWith(prefix)) {
            matchedModels.push(item);
        } else {
            unmatchedModels.push(item);
        }
    });


    matchedModels.forEach(item => {
        modelList.insertBefore(item, modelList.firstChild);
        item.querySelector('input[type="checkbox"]').checked = true;
    });

    unmatchedModels.forEach(item => {
        modelList.appendChild(item);
    });

    layui.form.render('checkbox');
    let count = matchedModels.length;
    updateSelectedCount2(count);
}

function clearFilter() {
    document.getElementById('prefixFilter').value = '';
    const modelItems = document.querySelectorAll('.model-item');
    const modelList = document.getElementById('modelList');

    modelItems.forEach(item => {
        item.querySelector('input[type="checkbox"]').checked = false;
        modelList.appendChild(item);
    });

    layui.form.render('checkbox');
    updateSelectedCount2(0);
}


// 更新已选择的模型数量
function updateSelectedCount(layero) {
    const selectedCount = layero.find('input[name^="models"]:checked').length;
    layero.find('#selectedCount').text(`已选择 ${selectedCount} 个模型`);
}

function updateSelectedCount2(count) {
    document.querySelector('#selectedCount').innerText = `已选择 ${count} 个模型`;
}

let results = {
    valid: [],
    invalid: [],
    inconsistent: [],
    awaitOfficialVerification: []
};

async function testModels() {
    results = {
        valid: [],
        invalid: [],
        inconsistent: [],
        awaitOfficialVerification: []
    };
    const apiUrl = document.getElementById('api_url').value.replace(/\/+$/, '');
    const apiKey = document.getElementById('api_key').value;
    const modelNames = document.getElementById('model_name').value.split(',').map(m => m.trim()).filter(m => m);
    const timeout = parseInt(document.getElementById('model_timeout').value) * 1000; // 转换为毫秒
    const concurrency = parseInt(document.getElementById('model_concurrency').value);

    if (modelNames.length === 0) {
        layui.use('layer', function () {
            const layer = layui.layer;

            layer.alert('请输入至少一个模型名称或从列表中选择模型');
        });
        return;
    }

    layui.use('layer', function () {
        let layer = layui.layer;
        layer.load();


        async function testModel(model) {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            const startTime = Date.now();

            let response_text;
            try {
                const requestBody = {
                    model: model,
                    messages: [{role: "user", content: "写一个10个字的冷笑话"}]
                };
                if (/^(gpt-|chatgpt-|o1-)/.test(model)) {
                    requestBody.seed = 331;
                }
                const response = await fetch(`${apiUrl}/v1/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                    signal: controller.signal
                });

                const endTime = Date.now();
                const responseTime = (endTime - startTime) / 1000; // 转换为秒

                if (response.ok) {
                    const data = await response.json();
                    const returnedModel = data.model;
                    if (returnedModel === model) {
                        results.valid.push({model, responseTime});
                        if (/^(gpt-|chatgpt-|o1-)/.test(model)) {
                            if (data.system_fingerprint) {
                                results.awaitOfficialVerification.push({
                                    model,
                                    system_fingerprint: data.system_fingerprint
                                });
                            }
                        }
                        console.log(`测试 API 节点：${apiUrl} 测试模型：${model} 模型一致，响应时间：${responseTime.toFixed(2)} 秒`);
                    } else {
                        results.inconsistent.push({model, returnedModel, responseTime});
                        console.log(`测试 API 节点：${apiUrl} 测试模型：${model} 模型不一致，期望：${model}，实际：${returnedModel}，响应时间：${responseTime.toFixed(2)} 秒`);
                    }
                } else {
                    try {
                        const jsonResponse = await response.json();
                        response_text = jsonResponse.error.message;
                    } catch (jsonError) {
                        try {
                            response_text = await response.text();
                        } catch (textError) {
                            response_text = '无法解析响应内容';
                        }
                    }
                    results.invalid.push({model, response_text})
                    console.log(`测试 API 节点：${apiUrl} 测试模型：${model} 模型不可用，响应：${response.status} ${response.statusText} ${response_text}`);
                }
            } catch (error) {
                if (error.name === 'AbortError') {
                    results.invalid.push({model, error: '超时'});
                    console.log(`测试 API 节点：${apiUrl} 测试模型：${model} 模型不可用（超时）`);
                } else {
                    results.invalid.push({model, error: error.message});
                    console.log(`测试 API 节点：${apiUrl} 测试模型：${model} 模型不可用，错误：${error.message}`);
                }
            } finally {
                clearTimeout(id);
            }
        }

        async function runBatch(models) {
            const promises = models.map(model => testModel(model));
            await Promise.all(promises);
        }

        async function runAllTests() {
            for (let i = 0; i < modelNames.length; i += concurrency) {
                const batch = modelNames.slice(i, i + concurrency);
                await runBatch(batch);
            }

            layer.closeAll('loading');
            displayResults(results);
            showSummary(results);
        }

        runAllTests().catch(error => {
            layer.closeAll('loading');
            layer.alert('测试模型时发生错误: ' + error.message);
        });
    });
}

function showSummary(results) {
    const validCount = results.valid.length;
    const inconsistentCount = results.inconsistent.length;
    const invalidCount = results.invalid.length;
    const totalCount = validCount + inconsistentCount + invalidCount;

    layui.use('layer', function () {
        const layer = layui.layer;
        layer.alert(`测试总结：<br>
                    总共测试了 ${totalCount} 个模型<br>
                    其中：<br>
                    - ${validCount} 个模型可用且一致<br>
                    - ${inconsistentCount} 个模型可用但不一致<br>
                    - ${invalidCount} 个模型不可用`,
            {title: '测试结果总结'}
        );
    });
}

// 显示测试结果
function displayResults(results) {
    const resultsDiv = document.getElementById('results');
    let content = '<h2>测试结果</h2>' +
        '<h3>（结果仅供参考，防君子不防小人）</h3>' +
        '<div class="copy-buttons">' +
        '<div class="submit-container">' +
        '<button class="check-quota copy-btn" onclick="copyConsistentModels()">复制一致模型</button>' +
        '<button class="check-quota copy-btn" onclick="copyConsistentAndInconsistentModels()">复制所有可用模型</button>' +
        '<button class="check-quota copy-btn"onclick="copyConsistentAndInconsistentReturedModels()">复制可用原始模型</button>' +
        '</div>' +
        '</div>' +
        '<table>' +
        '<tr>' +
        '<th class="td1">状态</th>' +
        '<th class="td2">模型名称</th>' +
        '<th class="td3">响应时间 (秒)</th>' +
        '<th class="td4">备注</th>' +
        '</tr>';

    results.valid.forEach(function (r) {
        content += '<tr>' +
            '<td class="td1 td1-ok">模型一致可用</ td>' +
            '<td class="td2"><span class="copy-btn2"" onclick="copyText(\'' + r.model + '\')">' + r.model + '</span></td>' +
            '<td class="td3">' + r.responseTime.toFixed(2) + '</td>'

        let verifyButtons = `
                <button class="verify-btn cyan" data-tooltip="校验函数功能是否可用,将发起1次请求" onclick="verifyFunctionCalling('${r.model}')">
                    函数验证
                </button>
            `;
        if (/^(gpt-|chatgpt-|o1-)/.test(r.model) || r.model.startsWith('claude-')) {
            let officialButtonClass = results.awaitOfficialVerification.some(item => item.model === r.model) ? "green" : "yellow";
            verifyButtons += `
                    <button class="verify-btn blue" data-tooltip="低温度参数下预测序列下一个值,将发起4次请求" onclick="verifyTemperature('${r.model}')">
                        温度验证
                    </button>
                    ${/^(gpt-|chatgpt-|o1-)/.test(r.model) ? ` 
                        <button class="verify-btn ${officialButtonClass}" data-tooltip="相同种子参数下校验回复相似性和系统指纹,将发起4次请求" onclick="verifyOfficial('${r.model}')">
                            官转验证
                        </button>
                    ` : ''}
                `;
        }
        content += `<td class="td4"><div class="verify-btn-group">${verifyButtons}</div></td>`;
    });

    results.inconsistent.forEach(function (r) {
        let verifyButtons = `<button class="verify-btn cyan" data-tooltip="校验函数功能是否可用,将发起1次请求" onclick="verifyFunctionCalling('${r.model}')">
                            函数验证
                        </button>`
        if (/^(gpt-|chatgpt-|o1-)/.test(r.model) || r.model.startsWith('claude-')) {
            let officialButtonClass = results.awaitOfficialVerification.some(item => item.model === r.model) ? "green" : "yellow";
            verifyButtons += `
                    <button class="verify-btn blue" data-tooltip="低温度参数下预测序列下一个值,将发起4次请求" onclick="verifyTemperature('${r.model}')">
                        温度验证
                    </button>
                    ${/^(gpt-|chatgpt-|o1-)/.test(r.model) ? ` 
                        <button class="verify-btn ${officialButtonClass}" data-tooltip="相同种子参数下校验回复相似性和系统指纹,将发起4次请求" onclick="verifyOfficial('${r.model}')">
                            官转验证
                        </button>
                    ` : ''}
                `;
        }
        let highlightedReturnModel = r.returnedModel;
        if (r.returnedModel.startsWith(`${r.model}-`)) {
            highlightedReturnModel = `<span style="color: green; font-weight: bold;">${r.model}</span>${r.returnedModel.slice(r.model.length)}<br>可能是带版本号模型映射`;
        }
        content += `
                <tr>
                    <td class="td1 td1-no" >模型不一致</br>疑似掺假!!!</td>
                    <td class="td2">
                        <span class="copy-btn2"" onclick="copyText('${r.model}')">${r.model}</span>
                    </td>
                    <td class="td3">${r.responseTime.toFixed(2)}</td>
                    <td class="td4">
                    ${verifyButtons}
                        <br>
                        ${r.returnedModel ? '返回模型: ' + highlightedReturnModel : '该接口未返回模型名称'}
                    </td>
                </tr>
            `;
    });

    results.invalid.forEach(function (r) {
        content += '<tr>' +
            '<td class="td1 td1-error">模型不可用!!!</td>' +
            '<td class="td2"><span class="copy-btn2" onclick="copyText(\'' + r.model + '\')">' + r.model + '</span></td>' +
            '<td class="td3">-</td>' +
            '<td class="td4">' + (r.response_text || r.error) + '</td>' +
            '</tr>';
    });

    content += '</table>';
    resultsDiv.innerHTML = content;
}

async function verifyOfficial(model) {
    layui.use('layer', function () {
        const layer = layui.layer;
        layer.prompt({
            formType: 0,
            value: '888',
            title: '请输入seed值 (1-900)',
            area: ['300px', '50px']
        }, function (seed, index) {
            layer.close(index);
            performOfficialVerification(model, parseInt(seed));

        });
    });
}

function findMostFrequent(arr) {
    const frequency = {};
    let maxCount = 0;
    let mostFrequentElement = null;

    for (const item of arr) {
        frequency[item] = (frequency[item] || 0) + 1;

        if (frequency[item] > maxCount) {
            maxCount = frequency[item];
            mostFrequentElement = item;
        }
    }

    return {element: mostFrequentElement, count: maxCount};
}

async function verifyTemperature(model) {
    layui.use("layer", function () {
        const layer = layui.layer;
        layer.load();
    });

    try {
        const results = await Promise.all(
            [1, 2, 3, 4].map(() => sendTemperatureVerificationRequest(model))
        );
        const responses = results.map((result) =>
            result.choices
                ? result?.choices?.[0]?.message?.content?.trim()
                : "该次调用响应异常"
        );
        const referenceMap = {
            "gpt-4o-mini": 32,
            "gpt-4o": 59,
            "claude-3-5": 51,
            "claude-3.5": 51
        };
        const matchedKey = Object.keys(referenceMap).find(key => model.startsWith(key));
        let referenceValue = matchedKey ? referenceMap[matchedKey] : null;

        layui.use("layer", function () {
            const layer = layui.layer;
            layer.closeAll("loading");

            let message = `<strong>当前待验证模型：${model}</strong><p>参考值：c3.5 = 51(gcp测试)，gpt-4o = 59，gpt-4o-mini = 32(azure测试)</p>`;
            message +=
                '<table css="width:100%; border-collapse: collapse; margin-bottom: 20px;">' +
                '<tr><th css="border: 1px solid #ddd; padding: 4px;">测试</th><th css="border: 1px solid #ddd; padding: 4px;">响应</th></tr>';
            let hitReferenceCount = 0;
            let color;
            for (let i = 0; i < 4; i++) {
                if (responses[i] == referenceValue) {
                    hitReferenceCount++;
                    color = "green";
                } else if (responses[i] == "该次调用响应失败") {
                    color = "red"
                } else {
                    color = "black";
                }
                message +=
                    "<tr>" +
                    '<td css="border: 1px solid #ddd; padding: 4px;">测试 ' +
                    (i + 1) +
                    "</td>" +
                    `<td style="border: 1px solid #ddd; padding: 4px; color: ${color};">` +
                    responses[i] +
                    "</td>" +
                    "</tr>";
            }

            message += "</table><strong>结论：</strong>";

            frequencyCheckResult = findMostFrequent(responses);
            const diffentCount = frequencyCheckResult.count;

            if (diffentCount === responses.length) {
                message += "所有响应相同，可能是官方API";
            } else {
                message += `响应结果重复度：${diffentCount}/${responses.length}`;
                // 检查模型前缀是否符合条件
                if (/^(gpt-4o|claude-3-5|claude-3.5)/.test(model)) {
                    message += `，参考值命中率：${hitReferenceCount}/${responses.length}`;
                }
                message += "，可能不是官方API";
            }

            message += "<br>";

            layer.alert(message, {
                title: "温度验证结果（<strong>无参考值模型请自行根据结果重复度判断</strong>）",
                area: ["600px", "400px"],
            });
        });
    } catch (error) {
        console.error("Error in verifyTemperature:", error);
        layui.use("layer", function () {
            const layer = layui.layer;
            layer.closeAll("loading");
            layer.alert("验证过程中发生错误: " + error.message, {
                title: "错误",
            });
        });
    }
}

async function sendTemperatureVerificationRequest(model) {
    const apiUrl = document
        .getElementById("api_url")
        .value.replace(/\/+$/, "");
    const apiKey = document.getElementById("api_key").value;
    try {
        const response = await fetch(`${apiUrl}/v1/chat/completions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "system",
                        content:
                            "You're an associative thinker. The user gives you a sequence of 6 numbers. Your task is to figure out and provide the 7th number directly, without explaining how you got there.",
                    },
                    {
                        role: "user",
                        content: "5, 15, 77, 19, 53, 54,",
                    },
                ],
                temperature: 0.01,
                model: model,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error in sendTemperatureVerificationRequest:", error);
        return {error: error.message};
    }
}

async function performOfficialVerification(model, seed) {
    layui.use('layer', function () {
        const layer = layui.layer;
        layer.load();
    });

    try {
        const results = await Promise.all([1, 2, 3, 4].map(() => sendVerificationRequest(model, seed)));
        const texts = [];
        const fingerprints = [];

        for (let i = 0; i < results.length; i++) {
            if (results[i].error) {
                console.error(`Error in request ${i + 1}:`, results[i].error);
                layui.use('layer', function () {
                    const layer = layui.layer;
                    layer.closeAll('loading');
                    layer.alert(`请求 ${i + 1} 失败: ${results[i].error}`, {title: '错误'});
                });
                return;
            }
            if (!results[i].choices?.[0]?.message?.content) {
                console.error(`Invalid response structure in request ${i + 1}:`, results[i]);
                layui.use('layer', function () {
                    const layer = layui.layer;
                    layer.closeAll('loading');
                    layer.alert(`请求 ${i + 1} 返回的数据结构无效`, {title: '错误'});
                });
                return;
            }
            texts.push(results[i].choices[0].message.content);
            fingerprints.push(results[i].system_fingerprint || 'N/A');
        }

        const similarity = compareTextSimilarity(texts[0], texts[1], texts[2], texts[3]);

        layui.use('layer', function () {
            api_url = document.getElementById('api_url').value;
            const layer = layui.layer;
            layer.closeAll('loading');
            if (api_url === "https://api.openai.com") {
                layer.alert("官方API你来验证？", {title: '官方API'});
            }
            let similarityCount = Object.values(similarity).filter(value => parseFloat(value) > 0.6).length;
            let lowSimilarityCount = Object.values(similarity).filter(value => parseFloat(value) < 0.1).length;

            let title = '验证结果';
            let message = '';
            if (similarityCount >= 3) {
                title = '恭喜你，官方API呀！';
                message += '<strong>Tips: 这是官方API！</strong>';
            } else if (similarityCount >= 2) {
                title = '可能是官方API';
                message += '<strong>Tips: 应该是官方的</strong>';
            } else if (lowSimilarityCount >= 2) {
                title = '可能是假的';
                message += '<strong>Tips: 假的8</strong>';
            } else {
                message += '<strong>Tips: 结果不确定，请进一步验证</strong>';
            }

            message += '<table css="width:100%; border-collapse: collapse; margin-bottom: 20px;">' +
                '<tr><th css="border: 1px solid #ddd; padding: 8px;">测试</th><th css="border: 1px solid #ddd; padding: 8px;">文本</th><th css="border: 1px solid #ddd; padding: 8px;">系统指纹</th></tr>';

            for (let i = 0; i < 4; i++) {
                message += '<tr>' +
                    '<td css="border: 1px solid #ddd; padding: 8px;">测试 ' + (i + 1) + '</td>' +
                    '<td css="border: 1px solid #ddd; padding: 8px;">' + texts[i] + '</td>' +
                    '<td css="border: 1px solid #ddd; padding: 8px;">' + fingerprints[i] + '</td>' +
                    '</tr>';
            }

            message += '</table>';

            message += '相似度结果：<br>' +
                Object.entries(similarity).map(([key, value]) => `${key}: ${value}`).join('<br>');


            layer.alert(message, {title: title, area: ['600px', '400px']});
        });
    } catch (error) {
        console.error('Error in performOfficialVerification:', error);
        layui.use('layer', function () {
            const layer = layui.layer;
            layer.closeAll('loading');
            layer.alert('验证过程中发生错误: ' + error.message, {title: '错误'});
        });
    }
}

async function sendVerificationRequest(model, seed) {
    const apiUrl = document.getElementById('api_url').value.replace(/\/+$/, '');
    const apiKey = document.getElementById('api_key').value;
    try {
        const response = await fetch(`${apiUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: "写一个10个字的冷笑话"
                    }
                ],
                seed: seed,
                temperature: 0.7,
                model: model
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in sendVerificationRequest:', error);
        return {error: error.message};
    }
}

async function verifyFunctionCalling(model) {
    console.log("开始验证函数调用");
    layui.use('layer', function () {
        const layer = layui.layer;

        layer.open({
            title: '请输入两个整数 a 和 b',
            area: ['400px', '250px'],
            content: `
                <div style="padding: 10px;">
                    <div style="margin-bottom: 10px;">
                        <label style="display: inline-block; width: 100px;">请输入整数 a:</label>
                        <input type="number" id="inputA" class="layui-input" style="width: 60px; display: inline-block;" value="3" placeholder="a">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="display: inline-block; width: 100px;">请输入整数 b:</label>
                        <input type="number" id="inputB" class="layui-input" style="width: 60px; display: inline-block;" value="5" placeholder="b">
                    </div>
                </div>
            `,
            btn: ['确定', '取消'],
            yes: function (index, layero) {
                const a = parseInt(document.getElementById('inputA').value);
                const b = parseInt(document.getElementById('inputB').value);

                if (isNaN(a) || isNaN(b)) {
                    layer.msg('请输入有效的整数 a 和 b');
                    return;
                }

                layer.close(index);
                performFunctionCallingVerification(model, a, b);
            }
        });
    });
}

async function sendFunctionCallingRequest(model, a, b) {
    const apiUrl = document.getElementById('api_url').value.replace(/\/+$/, '');
    const apiKey = document.getElementById('api_key').value;
    try {
        const response = await fetch(`${apiUrl}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [
                    {"role": "system", "content": "You are a helpful assistant."},
                    {"role": "user", "content": `Please add ${a} and ${b}.`}
                ],
                functions: [
                    {
                        "name": "add_numbers",
                        "description": "Adds two numbers together",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "a": {
                                    "type": "number",
                                    "description": "The first number"
                                },
                                "b": {
                                    "type": "number",
                                    "description": "The second number"
                                }
                            },
                            "required": ["a", "b"]
                        }
                    }
                ],
                function_call: "auto",
                temperature: 0.5,
                model: model
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in sendFunctionCallingRequest:', error);
        return {error: error.message};
    }
}

async function performFunctionCallingVerification(model, a, b) {
    layui.use('layer', function () {
        const layer = layui.layer;
        layer.load();
    });

    try {
        const result = await sendFunctionCallingRequest(model, a, b);

        if (result.error) {
            console.error(`Error in request:`, result.error);
            layui.use('layer', function () {
                const layer = layui.layer;
                layer.closeAll('loading');
                layer.alert(`请求失败: ${result.error}`, {title: '错误'});
            });
            return;
        }

        layui.use('layer', function () {
            const layer = layui.layer;
            layer.closeAll('loading');
            const title = '<b><span css="color: black;">模型函数调用响应对比（非openai模型的函数调用响应可能有差异，但肉眼可辨）</span></b>';
            let text;
            // 第一种是 openai 的函数调用响应，第二种是经 oneapi 中转后 gemini 的函数调用响应，目前手里只有这两种支持 FC
            if (result.choices?.[0]?.finish_reason === 'function_call' || result.choices?.[0]?.message?.tool_calls?.[0]?.type === "function") {
                text = '<b><span css="color: green;">模型返回了函数调用响应，测试模型为：' + model + '</span></b>';
            } else {
                text = '<b><span css="color: red;">模型无函数调用响应返回，测试模型为：' + model + '</span></b>';
            }
            const referenceFunctionCall = JSON.stringify({
                "index": 0,
                "message": {
                    "role": "assistant",
                    "content": null,
                    "function_call": {
                        "name": "add_numbers",
                        "arguments": `{"a":${a},"b":${b}}`
                    },
                },
                "logprobs": null,
                "finish_reason": "function_call",
            }, null, 4);
            const modelFunctionCall = JSON.stringify(result.choices?.[0], null, 4);
            const message = text + `
                    <table border="1" style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr>
                                <th style="padding: 8px; background-color: #f2f2f2;">OpenAI 标准输出参考</th>
                                <th style="padding: 8px; background-color: #f2f2f2;">测试模型输出</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 8px;">
                                    <pre style="white-space: pre-wrap; word-wrap: break-word;">${referenceFunctionCall}</pre>
                                </td>
                                <td style="padding: 8px;">
                                    <pre style="white-space: pre-wrap; word-wrap: break-word;">${modelFunctionCall}</pre>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                `;
            layer.alert(message, {title: title, area: ['800px', '600px']});
        });
    } catch (error) {
        console.error('Error in performOfficialVerification:', error);
        layui.use('layer', function () {
            const layer = layui.layer;
            layer.closeAll('loading');
            layer.alert('验证过程中发生错误: ' + error.message, {title: '错误'});
        });
    }
}

function compareTextSimilarity(text1, text2, text3, text4) {
    function calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix = Array(len1 + 1).fill().map(() => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) matrix[i][0] = i;
        for (let j = 0; j <= len2; j++) matrix[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j - 1] + cost
                );
            }
        }

        return 1 - matrix[len1][len2] / Math.max(len1, len2);
    }

    return {
        similarity12: calculateSimilarity(text1, text2).toFixed(4),
        similarity13: calculateSimilarity(text1, text3).toFixed(4),
        similarity14: calculateSimilarity(text1, text4).toFixed(4),
        similarity23: calculateSimilarity(text2, text3).toFixed(4),
        similarity24: calculateSimilarity(text2, text4).toFixed(4),
        similarity34: calculateSimilarity(text3, text4).toFixed(4)
    };
}


// 复制文本功能
function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        layui.use('layer', function () {
            const layer = layui.layer;
            layer.msg('模型名已复制到剪贴板');
        });
    }).catch(err => {
        console.error('复制失败:', err);
    });
}


// 检查额度
function checkQuota() {
    const apiUrl = document.getElementById('api_url').value.replace(/\/+$/, '');
    const apiKey = document.getElementById('api_key').value;

    layui.use('layer', function () {
        const layer = layui.layer;
        layer.load();

        let quotaInfo, usedInfo, remainInfo;

        // 获取总额度
        fetch(`${apiUrl}/dashboard/billing/subscription`, {
            headers: {'Authorization': `Bearer ${apiKey}`}
        })
            .then(response => response.json())
            .then(quotaData => {
                quotaInfo = quotaData.hard_limit_usd ? `${quotaData.hard_limit_usd.toFixed(2)} $` : '无法获得额度信息';

                // 获取使用情况
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const startDate = `${year}-${month}-01`;
                const endDate = `${year}-${month}-${day}`;

                return fetch(`${apiUrl}/dashboard/billing/usage?start_date=${startDate}&end_date=${endDate}`, {
                    headers: {'Authorization': `Bearer ${apiKey}`}
                });
            })
            .then(response => response.json())
            .then(usageData => {
                usedInfo = `${(usageData.total_usage / 100).toFixed(2)} $`;

                // 计算剩余额度
                const quotaNumber = parseFloat(quotaInfo);
                const usedNumber = parseFloat(usedInfo);
                if (!isNaN(quotaNumber) && !isNaN(usedNumber)) {
                    remainInfo = `${(quotaNumber - usedNumber).toFixed(2)} $`;
                } else {
                    remainInfo = '无法计算剩余额度';
                }

                const showInfo = `可用额度为: ${remainInfo}\n\n已用额度为: ${usedInfo}\n\n总额度为: ${quotaInfo}`;
                layer.closeAll('loading');
                layer.alert(showInfo);
            })
            .catch(error => {
                layer.closeAll('loading');
                layer.alert('检查额度失败: ' + error.message);
            });
    });
}

// 清空表单
function clearForm() {
    document.getElementById('apiForm').reset();
    document.getElementById('results').innerHTML = '';
}

// 复制一致模型
function copyConsistentModels() {
    const models = results.valid.map(function (r) {
        return r.model;
    });
    copyText(models.join(','));
}

// 复制所有可用模型去重
function copyConsistentAndInconsistentModels() {
    const models = results.valid.map(function (r) {
        return r.model;
    })
        .concat(results.inconsistent.map(function (r) {
            return r.model;
        }));
    const uniqueModels = Array.from(new Set(models)); // 去重
    copyText(uniqueModels.join(','));
}


// 复制一致和不一致模型的原始模型的函数名称 去重
function copyConsistentAndInconsistentReturedModels() {
    const models = results.valid.map(function (r) {
        return r.model;
    })
        .concat(results.inconsistent.map(function (r) {
            return r.returnedModel;
        }));
    let uniqueModels = Array.from(new Set(models)); // 去重
    //去除undefined
    uniqueModels = uniqueModels.filter(function (s) {
        return s && s.trim();
    });
    copyText(uniqueModels.join(','));
}