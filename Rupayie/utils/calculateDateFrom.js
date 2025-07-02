export default function calculateDaysFrom(dateString) {
  const givenDate = new Date(dateString);
  const today = new Date();

  // Calculate the difference in milliseconds
  const differenceInMs = today - givenDate;

  // Convert milliseconds to days
  const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

  return 7- differenceInDays;
}