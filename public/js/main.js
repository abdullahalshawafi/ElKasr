$(() => {
    if ($('textarea#ta').length)
        CKEDITOR.replace('ta');

    $('a.confirmDeletion').on('click', () => {
        if (!confirm('Are you sure you want to delete this page?')) return false;
    });

    if ($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }
});

function myFunction(slug) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', '/cart/add/' + slug, true);
    xhr.onload = function () {
        if (this.status == 200) {
            let cart = JSON.parse(this.responseText).cart;
            let sum = 0;
            cart.forEach(product => {
                sum += product.qty;
            });
            document.getElementById('cart').innerText = 'My cart ( ' + sum + ' )';
        }
    }
    xhr.onerror = function () {
        console.log('err');
    }
    xhr.send();
}