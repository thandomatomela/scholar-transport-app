export default function DataDeletionPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm md:p-12">
        <h1 className="text-3xl font-bold">
          Via Nova Data Deletion Instructions
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Last updated: 24 October 2026
        </p>

        <div className="mt-8 space-y-8 leading-7">
          <section>
            <h2 className="text-xl font-semibold">
              Request deletion of your information
            </h2>

            <p className="mt-3">
              Customers may request deletion of personal information associated
              with their Via Nova account, transport service or WhatsApp
              communication history.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              How to submit a deletion request
            </h2>

            <p className="mt-3">
              Send an email to:
            </p>

            <p className="mt-3">
              <a
                href="mailto:thandomatomela00@gmail.com"
                className="font-medium text-blue-600 hover:underline"
              >
                thandomatomela00@gmail.com
              </a>
            </p>

            <p className="mt-3">
              Use the subject line:
            </p>

            <div className="mt-3 rounded-lg bg-slate-100 p-4 font-medium">
              Via Nova Data Deletion Request
            </div>

            <p className="mt-4">
              Please include enough information for us to identify the relevant
              customer record, such as:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Your full name.</li>
              <li>Your WhatsApp or contact number.</li>
              <li>The learner name associated with your transport service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              What happens after your request
            </h2>

            <p className="mt-3">
              We may contact you to verify your identity before processing the
              request.
            </p>

            <p className="mt-3">
              Once verified, we will remove or anonymise personal information
              that is no longer required, subject to information that Via Nova
              may be required to retain for legal, financial, safety, dispute
              resolution or legitimate business record purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              Information that may be deleted
            </h2>

            <p className="mt-3">
              Depending on the request and applicable requirements, deletion
              may include:
            </p>

            <ul className="mt-3 list-disc space-y-2 pl-6">
              <li>Customer contact information.</li>
              <li>Learner profile information.</li>
              <li>Saved WhatsApp conversation history.</li>
              <li>Transport preferences.</li>
              <li>Other information associated with the customer profile.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">
              Questions
            </h2>

            <p className="mt-3">
              If you have questions regarding deletion or privacy, contact us
              at{" "}
              <a
                href="mailto:thandomatomela00@gmail.com"
                className="text-blue-600 hover:underline"
              >
                thandomatomela00@gmail.com
              </a>
              .
            </p>
          </section>

          <p className="border-t pt-6 text-sm text-slate-500">
            See our{" "}
            <a
              href="/privacy"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </a>{" "}
            for more information about how Via Nova handles personal
            information.
          </p>
        </div>
      </div>
    </main>
  );
}