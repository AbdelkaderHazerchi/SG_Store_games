import { Link } from 'react-router-dom';

export default function SitePolicy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-xl border-t-4 border-primary bg-surface-raised p-8 shadow-xl ring-1 ring-slate-800 sm:p-10">
        <h1 className="text-center text-3xl font-bold text-primary">SG Store Legal Agreements</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Last Updated: August 28, 2026</p>

        <section id="terms-of-service" className="mt-10">
          <h2 className="border-b border-slate-700 pb-2 text-xl font-bold text-primary">Terms of Service</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Welcome to <strong className="text-white">SG Store</strong>. By registering an account, accessing, or using our platform, you signify your complete agreement to these Terms of Service and our Privacy Policy. If you do not agree to these terms, you may not use our services.
          </p>

          <h3 className="mt-6 text-base font-semibold text-primary">1. Game Publishing, Rights, and Licensing</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
            <li><strong className="text-white">Developer Ownership:</strong> Publishing your game on SG Store preserves your absolute rights as the original developer and creator of the game. You retain all intellectual property rights to your assets, code, and brand.</li>
            <li><strong className="text-white">License to SG Store:</strong> By publishing your game on our platform, you grant SG Store a worldwide, royalty-free, non-exclusive license to host, distribute, publicly display, and promote your game. This includes the right to feature your game in advertisements, adapt its presentation for new display formats, or include it in bundled projects (such as desktop client applications) directly related to SG Store.</li>
          </ul>

          <h3 className="mt-6 text-base font-semibold text-primary">2. Content Moderation and Banning Policy</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-300">
            <li><strong className="text-white">Community Standards:</strong> Any game reported by the community for containing inappropriate, unethical, or malicious content is subject to immediate review.</li>
            <li><strong className="text-white">Penalties:</strong> Verified violations will result in the immediate removal or banning of the game. Repeated offenses or severe violations will result in the permanent banning or restriction of the developer&apos;s account without prior notice.</li>
          </ul>

          <h3 className="mt-6 text-base font-semibold text-primary">3. Copyright Infringement &amp; Intellectual Property</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            If you believe your intellectual property rights have been violated by content hosted on SG Store, you must submit a formal report. <strong className="text-white">All reports of IP infringement must be accompanied by conclusive, irrefutable evidence proving your full ownership of the disputed products or assets.</strong> Baseless reports will be ignored.
          </p>

          <h3 className="mt-6 text-base font-semibold text-primary">4. Account Security &amp; User Responsibility</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            You are solely responsible for maintaining the confidentiality of your login credentials. Any errors, negligence, or unauthorized actions resulting from your failure to secure your account are entirely your responsibility. SG Store is not liable for any damages resulting from user negligence.
          </p>
        </section>

        <section id="privacy-policy" className="mt-10">
          <h2 className="border-b border-slate-700 pb-2 text-xl font-bold text-primary">Privacy Policy</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">Your privacy is important to us. This policy outlines how we handle your data.</p>

          <h3 className="mt-6 text-base font-semibold text-primary">1. Data Security and Internet Risks</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            We implement all reasonable technical and organizational measures within our capabilities to ensure the privacy of your usage and to protect the rights of content creators. However, <strong className="text-white">there is no absolute guarantee of security on the internet.</strong> By using SG Store, you acknowledge and accept the inherent risks of transmitting data online.
          </p>

          <h3 className="mt-6 text-base font-semibold text-primary">2. Hacked Accounts and Support Limits</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            In the event of an account breach, security issue, or technical problem, you may contact our support team. We will attempt to assist you on a best-effort basis. However, please be advised that <strong className="text-white">our team is very small</strong>; therefore, extensive recovery operations or immediate resolutions cannot be guaranteed. Protect your data proactively.
          </p>
        </section>

        <div className="mt-10 rounded-lg border-l-4 border-primary bg-slate-800/50 p-5">
          <h3 className="text-sm font-semibold text-white">Contact &amp; Support</h3>
          <p className="mt-2 text-sm text-slate-300">For IP claims, account recovery requests, or general support, please reach out to us at:</p>
          <p className="mt-1 text-sm">
            Email: <a href="mailto:abdelkaderhaz96@gmail.com" className="text-primary-light hover:text-primary hover:underline">abdelkaderhaz96@gmail.com</a>
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm font-medium text-primary-light hover:text-white">← Back to Store</Link>
        </div>
      </div>
    </div>
  );
}
