$(document).ready(function () {
    // Fetch and display blog posts
    fetch('/api/blogs')
        .then(response => response.json())
        .then(data => {
            const blogList = $('#blogs-list');
            data.forEach(blog => {
                const blogItem = `
                    <div class="card">
                        <h3>${blog.title}</h3>
                        <p>${blog.content}</p>
                        <p><strong>Author:</strong> ${blog.authorName}</p>
                        <p><strong>Date:</strong> ${blog.date}</p>
                    
                    </div>`;
                blogList.append(blogItem);
            });
        });
//read more button is not working properly so removed it     <button onclick="location.href='/api/blogs/${blog._id}'">Read More</button>
    // Fetch and display volunteers
    fetch('/api/volunteers')
        .then(response => response.json())
        .then(data => {
            const volunteerList = $('#volunteers-list');
            data.forEach(volunteer => {
                const volunteerItem = `
                    <div class="card">
                    <p>Message: ${volunteer.message}</p>
                        <p><strong>Volunteer's Name:</strong>${volunteer.name}</p>                        
                    </div>`;
                volunteerList.append(volunteerItem);
            });
        });

    // Fetch and display donors
    fetch('/api/donors')
        .then(response => response.json())
        .then(data => {
            const donorList = $('#donors-list');
            data.forEach(donor => {
                const donorItem = `
                    <div class="card">
                        <h3>${donor.name}</h3>
                        <p>${donor.email}</p>
                        <p><strong>Amount:</strong> ${donor.amount}</p>
                        <p><strong>Category:</strong> ${donor.category}</p>
                        <button>Thank</button>
                    </div>`;
                donorList.append(donorItem);
            });
        });

    // Hamburger menu toggle
    $('.hamburger').on('click', function () {
        $('.sidebar').toggleClass('active');
    });

    // Logout functionality
    $('.fa-sign-out-alt').on('click', function () {
        fetch('/logout')
            .then(() => window.location.href = '/login');
    });

    // Show blog post form on button click
    $('#add-blog-btn').on('click', function () {
        $('#blog-post-form').toggle();
    });

    // Handle blog post form submission
    $('#blog-post-form').on('submit', function (e) {
        e.preventDefault();
        const formData = {
            title: $('#title').val(),
            content: $('#content').val(),
            authorName: $('#authorName').val(),
            picture: $('#picture').val()
        };

        fetch('/post-blog', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(() => {
                alert('Blog posted successfully');
                $('#blog-post-form').trigger("reset");
            })
            .catch(() => alert('Error posting blog'));
    });
});

