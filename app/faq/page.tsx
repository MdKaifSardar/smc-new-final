export default function FAQ() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Frequently Asked Questions</h1>
      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">What is your return policy?</h2>
          <p>
            We accept returns within 30 days of purchase. Items must be in their original condition.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Do you offer custom tailoring?</h2>
          <p>
            Yes, we offer custom tailoring for shirts. Visit our "Custom Shirts" page for more details.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">How can I track my order?</h2>
          <p>
            You can track your order using the tracking link provided in your confirmation email.
          </p>
        </div>
      </div>
    </div>
  );
}
