const demoUpi = 'upi://pay?pa=PPQR01.UTGOQA@iob&pn=Aatreyee%20Enterprise&am=499.00';

export default function PaymentsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h2 className="font-semibold">UPI Payment Verification</h2>
        <p className="text-sm text-slate-600">AI generates payment links and ops verifies screenshots.</p>
      </div>
      <a href={demoUpi} className="inline-block rounded-lg bg-brand px-4 py-2 text-white">
        Pay Now (Demo)
      </a>
    </div>
  );
}
