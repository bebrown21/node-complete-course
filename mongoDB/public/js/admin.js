const deleteProduct = (btn) => {
  const prodId = btn.parentNode.quearySelector('[name=productId]').value;
  const csrf = btn.parentNode.quearySelector('[name=_csrf]').value;
  const productElement = btn.closest('article');

  fetch('/admin/product/' + prodId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
  .then(result => result.json())
  .then(data => {
    productElement.parentNode.removeChild(productElement);
  })
  .catch(err => console.log(err));
};