$(document).ready(() => {

    $(".logoutBtn").click( () => {

        console.log("logout button clicked!");

        event.preventDefault();

        console.log(document.cookie);

        $.post("/logout")
            .done( (data) => {
                console.log(data);
                if (data === true) {
                    alert("Logout Successful!");
                } else {
                    alert("Could Not Logout");
                };

            });

    });

});