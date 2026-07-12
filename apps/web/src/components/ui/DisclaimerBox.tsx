export function DisclaimerBox({ text }: { text: string }) {
  return (
    <div className="disclaimer-box" role="note">
      <strong>Disclaimer: </strong>
      {text}
    </div>
  );
}
