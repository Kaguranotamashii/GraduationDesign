import React from 'react';
import MainLayout from '@/layout/MainLayout.jsx';

const TermsOfUse = () => {
    return (
        <MainLayout>
            <div className="text-gray-900 p-10 max-w-4xl mx-auto shadow-lg rounded-xl border border-gray-200">
                <h1 className="text-4xl font-bold text-center mb-8 text-indigo-700">使用条款</h1>
                <p className="text-lg mb-6 text-center text-gray-600 leading-relaxed">
                    欢迎使用筑境云枢！这是一个致力于中国传统建筑文化传承的开源平台。在使用前，请仔细阅读并同意以下条款。使用本平台即表示您接受这些条款的约束。
                </p>
                <section className="space-y-8">
                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">1. 服务使用</h2>
                    <p className="text-gray-700">
                        筑境云枢旨在为用户提供传统建筑文化的学习、分享与协作平台。您同意：
                    </p>
                    <ul className="list-disc pl-6 text-gray-700">
                        <li>仅将平台用于合法用途，遵守所有适用法律和法规。</li>
                        <li>不上传或传播违法、有害、侵权或违反公序良俗的内容。</li>
                        <li>尊重其他用户的权利与贡献，共同维护社区的开放与专业氛围。</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">2. 用户责任</h2>
                    <p className="text-gray-700">
                        您对通过您的账户进行的所有活动负责，包括：
                    </p>
                    <ul className="list-disc pl-6 text-gray-700">
                        <li>保护账户凭证（如密码）的安全，防止未经授权的访问。</li>
                        <li>对上传的内容（如模型、文章）拥有合法权利或授权。</li>
                        <li>若发现账户被滥用，及时通知我们以采取措施。</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">3. 知识产权</h2>
                    <p className="text-gray-700">
                        平台上的内容分为两类：
                    </p>
                    <ul className="list-disc pl-6 text-gray-700">
                        <li>平台原创内容（如界面设计、技术框架）归筑境云枢或其授权方所有，未经许可不得复制或商业使用。</li>
                        <li>用户贡献内容（如模型、文章）遵循开源协议（如 MIT 或 CC BY-SA），具体许可由贡献者声明。</li>
                    </ul>
                    <p className="text-gray-700">
                        我们鼓励自由分享，但请尊重知识产权，引用时注明出处。
                    </p>

                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">4. 服务中断与免责</h2>
                    <p className="text-gray-700">
                        我们尽力确保平台稳定运行，但不保证服务永不中断。我们可能因维护、升级或不可抗力（如自然灾害）暂停服务，且不对因此造成的损失承担责任。
                    </p>
                    <p className="text-gray-700">
                        平台内容由社区共同维护，我们不对用户上传内容的准确性或完整性作担保。
                    </p>

                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">5. 社区参与</h2>
                    <p className="text-gray-700">
                        筑境云枢是一个社区驱动的平台，我们欢迎您：
                    </p>
                    <ul className="list-disc pl-6 text-gray-700">
                        <li>提交新功能、模型或改进建议。</li>
                        <li>参与讨论，分享建筑文化见解。</li>
                        <li>报告问题或协助完善文档。</li>
                    </ul>
                    <p className="text-gray-700">
                        具体参与方式请参考我们的 <a href="#" className="text-indigo-600 hover:underline">贡献指南</a>。
                    </p>

                    <h2 className="text-2xl font-semibold text-indigo-600 border-b-2 border-indigo-200 pb-2">6. 法律适用</h2>
                    <p className="text-gray-700">
                        本条款受中华人民共和国法律管辖。如发生争议，双方应友好协商解决；协商不成时，提交有管辖权的人民法院裁决。
                    </p>

                    <p className="text-center text-sm mt-8 text-gray-500 italic">
                        如有疑问，欢迎通过 GitHub Issues 或官方邮箱联系我们。让我们共同努力，通过数字创新让传统建筑文化焕发新生。
                    </p>
                </section>
            </div>
        </MainLayout>
    );
}

export default TermsOfUse;