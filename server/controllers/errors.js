export function failure(res, error) {
  console.error(error);
  return res.status(error.status || 500).json({
    error: error.status ? error.message : 'The request could not be completed. Please try again.'
  });
}
