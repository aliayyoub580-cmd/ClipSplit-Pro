const faqs = [
  ["Is ClipSplit Pro free?", "Yes. You can split videos into short clips without login or payment."],
  ["Are my videos uploaded?", "Yes. Videos are uploaded to the ClipSplit Pro server for fast native FFmpeg splitting, then temporary files are cleaned automatically."],
  ["What clip durations are supported?", "You can select any whole-second duration from 3 seconds through 15 seconds."],
  ["Which files work best?", "MP4 works best. MOV, WEBM, and MKV files may also work depending on the codec."],
  ["Why can large files be slow?", "Processing speed depends on upload speed, source codec, file size, server load, and clip count."],
  ["Can I download everything at once?", "Yes. Use Download all as ZIP after clips are generated."]
];

export default function FAQ() {
  return (
    <section className="app-container py-16" id="faq" aria-labelledby="faq-title">
      <h2 id="faq-title" className="text-3xl font-black">FAQ</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {faqs.map(([question, answer]) => (
          <details key={question} className="glass rounded-2xl p-5">
            <summary className="cursor-pointer font-bold">{question}</summary>
            <p className="mt-3 text-sm leading-7 text-muted">{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export { faqs };
