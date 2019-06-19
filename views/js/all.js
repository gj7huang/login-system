let userList = [];
let loginUserIndex = -1;

function initFormAnimation() {
    $('.toggle-register').click(function () {
        $(this).addClass('active');
        $('.toggle-login').removeClass('active');
        $('.login-body').slideUp("slow");
        $('.register-body').delay(625).slideDown("nomal");

        $('#login-email').val('');
        $('#login-pwd').val('');
        $('#login-msg').text('');
    });

    $('.toggle-login').click(function () {
        $(this).addClass('active');
        $('.toggle-register').removeClass('active');
        $('.register-body').slideUp("slow");
        $('.login-body').delay(625).slideDown("nomal");

        $('#register-student-id').val('');
        $('#register-email').val('');
        $('#register-pwd').val('');
        $('#gender-select').val('-1');
        $('#register-msg').text('');
    });

    $('#registered').click(function () {
        $('.toggle-login').click();
    });
}

function getAllUser() {
    $('#all-user-info').empty();
    $.ajax({
        url: '/showAllUser',
        method: "GET",
    }).then(res => {
        userList = res;
        res.map((el, index) => {
            $('#all-user-info').append(`
                <div class="user-info" id="item-${index}">
                    <h3>${el.student_id}</h3>
                    <ul>
                        <il>Email: ${el.email}</il>
                        <il>Gender: ${el.gender}</il>
                    </ul>
                </div>
            `);
        })
    });
}

function readyFunc() {
    initFormAnimation();
    getAllUser();

    $('#btn-login').click((event) => {
        let email = $('#login-email').val();
        let pwd = $('#login-pwd').val();
        $.ajax({
            url: '/login',
            method: "POST",
            data: {
                email: email,
                password: pwd
             }
        }).then(res => {
            $('#all-user-info > div').removeClass('user-active');
            userList.map((el, index) => {
                if (el.student_id === res.user.student_id) {
                    loginUserIndex = index;
                    $(`#item-${index}`).addClass('user-active');
                }
            })
            $('#login-msg').text(res.successMsg);
        }).catch(err => {
            $('#all-user-info > div').removeClass('user-active');

            $('#login-msg').text(err.responseJSON.errorMsg);
        });
    })

    $('#btn-register').click((event) => {
        let student_id = $('#register-student-id').val();
        let email = $('#register-email').val();
        let pwd = $('#register-pwd').val();
        let gender = $('#gender-select').val();

        $.ajax({
            url: '/register',
            method: "POST",
            data: {
                student_id: student_id,
                email: email,
                password: pwd,
                gender: gender,
            }
        }).then(res => {
            getAllUser();
            $('#register-msg').text(res.successMsg);
        }).catch(err => {
            $('#register-msg').text(err.responseJSON.errorMsg);
        });
    })
}

$(document).ready(readyFunc);