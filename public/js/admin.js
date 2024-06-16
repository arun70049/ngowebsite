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
                        <button onclick="location.href='/blog-details?_id=${blog._id}'">Read More</button>
                    </div>`;
                blogList.append(blogItem);
            });
        });

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
                        <h3><strong>Name:</strong> ${donor.name}</h3>
                        <p><strong>D.O.B:</strong> ${donor.dob}</p>
                        <p><strong>Email:</strong> ${donor.email}</p>
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
    $('.sign-out').on('click', function () {
        fetch('/logout')
            .then(() => window.location.href = '/login');
    });

    // Show blog post form on button click
    $('#add-blog-btn').on('click', function () {
        $('#blog-post-form').toggle();
    });

    // Handle blog post form submission
   
});

