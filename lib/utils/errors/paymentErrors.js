
export const handlePaymentError = (error, context = '') => {
  const errorMessage = error?.message?.toLowerCase() || '';
  let specificMessage = 'A payment processing error occurred.';

  if (errorMessage.includes('card declined')) {
    specificMessage = 'Your card was declined. Please check your card details or try a different card.';
  } else if (errorMessage.includes('insufficient funds')) {
    specificMessage = 'Insufficient funds. Please check your balance or use a different payment method.';
  } else if (errorMessage.includes('invalid card number') || errorMessage.includes('invalid_number')) {
    specificMessage = 'Invalid card number. Please ensure the card number is correct.';
  } else if (errorMessage.includes('invalid expiry') || errorMessage.includes('invalid_expiry')) {
    specificMessage = 'Invalid card expiry date. Please check the expiration month and year.';
  } else if (errorMessage.includes('invalid cvc') || errorMessage.includes('invalid_cvc')) {
    specificMessage = 'Invalid CVC/CVV. Please check the security code on your card.';
  } else if (errorMessage.includes('payment gateway error') || errorMessage.includes('stripe')) {
    specificMessage = 'There was an issue with the payment gateway. Please try again later.';
  } else if (errorMessage.includes('transaction failed')) {
    specificMessage = 'The transaction failed. Please try again or contact support.';
  }

  console.error(`Payment Error in ${context}: ${error.message}`, error);
  return `${specificMessage} (Context: ${context})`;
};
