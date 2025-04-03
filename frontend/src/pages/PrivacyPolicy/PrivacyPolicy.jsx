import React from 'react';
import MainLayout from '@/layout/MainLayout.jsx';

const PrivacyPolicy = () => {
    return (
        <MainLayout>
            <div className="text-gray-900 p-10 max-w-4xl mx-auto shadow-lg rounded-xl border border-gray-200">
                <h1 className="text-4xl font-bold text-center mb-8 text-indigo-700">隐私政策</h1>
                <p className="text-lg mb-6 text-center text-gray-600 leading-relaxed">
                    筑境云枢致力于保护您的隐私。本隐私政策详细说明了我们如何收集、使用和保护您的个人信息，以确保您在使用我们平台时的安全与信任。请在使用前仔细阅读。
                </p>
                <section className="space-y-8">
                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">1. 我们收集的信息</h2>
                    <p className="text-gray-700">
                        为了提供更好的服务并支持社区协作，我们可能收集以下信息：
                    </p>
                    <ul className="list-disc pl-6 text-gray-700">
                        <li>注册时提供的个人信息，如姓名、电子邮件地址和可选的位置信息。</li>
                        <li>您在使用平台时上传的内容，包括但不限于建筑模型、文章、评论或反馈。</li>
                        <li>技术数据，如IP地址、浏览器类型和访问时间，用于优化平台体验。</li>
                    </ul>
                    <p className="text-gray-700">
                        所有信息收集均遵循透明和自愿原则，您可随时选择提供或拒绝提供非必要信息。
                    </p>

                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">2. 如何使用您的信息</h2>
                    <p className="text-gray-700">
                        我们使用您的信息以支持筑境云枢的核心使命——传承与传播传统建筑文化。具体用途包括：
                    </p>
                    <ul className="list-disc pl-6 text-gray-700">
                        <li>提供个性化服务，如推荐相关建筑模型或文章。</li>
                        <li>支持社区互动，例如展示您的贡献或联系您参与讨论。</li>
                        <li>分析平台使用情况，以改进功能和技术体验。</li>
                        <li>在您同意的情况下，向您发送平台更新、活动通知或文化资讯。</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">3. 数据安全</h2>
                    <p className="text-gray-700">
                        我们深知数据安全的重要性，采用行业标准的安全措施（如加密传输和存储）保护您的个人信息，防止未经授权的访问、泄露或滥用。同时，我们定期审查安全策略，确保与时俱进。
                    </p>
                    <p className="text-gray-700">
                        若发生数据安全事件，我们将依法及时通知受影响的用户，并采取补救措施。
                    </p>

                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">4. 用户权利</h2>
                    <p className="text-gray-700">
                        作为筑境云枢的用户，您拥有以下权利：
                    </p>
                    <ul className="list-disc pl-6 text-gray-700">
                        <li>访问：随时查看我们持有的您的个人信息。</li>
                        <li>修改：更新或更正您的账户信息。</li>
                        <li>删除：请求删除您的个人信息（除法律要求保留的部分外）。</li>
                        <li>退出：随时取消订阅通知或退出平台。</li>
                    </ul>
                    <p className="text-gray-700">
                        请通过 GitHub Issues 或发送邮件至我们的官方邮箱联系我们行使这些权利。
                    </p>

                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">5. 第三方共享</h2>
                    <p className="text-gray-700">
                        我们不会将您的个人信息出售或随意共享给第三方，仅在以下情况下与可信伙伴合作：
                    </p>
                    <ul className="list-disc pl-6 text-gray-700">
                        <li>为提供服务所需（如云存储或技术支持）。</li>
                        <li>法律要求或保护平台及用户权益时。</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">6. 政策更新</h2>
                    <p className="text-gray-700">
                        随着平台发展或法律法规变化，我们可能更新本隐私政策。所有更改将在本页面发布，并注明生效日期。我们建议您定期查看以了解最新内容。
                    </p>

                    <p className="text-center text-sm mt-8 text-gray-500 italic">
                        如有疑问或建议，欢迎通过 GitHub Issues 或邮件联系我们。筑境云枢愿与您携手，共同守护传统建筑文化的数字未来。
                    </p>
                </section>
            </div>
        </MainLayout>
    );
}

export default PrivacyPolicy;