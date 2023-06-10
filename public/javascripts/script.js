
        function addToCart(proId) {
        $.ajax({
            url: '/addToCart/' + proId,
            method: 'get',
            success: (response) => {

                if (response.status) {
                    console.log(response.status)
                    let count = $('#cartCount').html()
                    count = parseInt(count) + 1
                    console.log(count, "hhhhhhhhh");

                    $("#cartCount").html(count)
                    Swal.fire({
                        icon: 'success',
                        title: 'Added to Cart',
                    })
                } else {

                    Swal.fire({
                        icon: 'warning',
                        title: 'Out of Stock',
                    }).then(() => {
                        location.reload();
                    });


                }

            }
        })
    }
