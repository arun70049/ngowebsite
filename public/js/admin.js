$(document).ready(function () {
       // Function to fetch and display blog posts
       const fetchBlogPosts = () => {
        fetch('/api/blogs-list') // Using the endpoint for paginated blogs
            .then(response => response.json())
            .then(data => {
                const blogList = $('#blogs-list');
                blogList.empty(); // Clear existing blog posts

                data.blogs.forEach(blog => {
                    const blogItem = `
                        <div class="card">
                            <h3>${blog.title}</h3>
                            <p>${blog.content}</p>
                            <p><strong>Author:</strong> ${blog.authorName}</p>
                            <p><strong>Date:</strong> ${new Date(blog.date).toLocaleDateString()}</p>
                            <button onclick="location.href='/blog-details?_id=${blog._id}'">Read More</button>
                            <button class="delete-blog-btn" data-blog-id="${blog._id}">Delete</button>
                        </div>`;
                    blogList.append(blogItem);
                });

                // Add event listeners for delete buttons
                $('.delete-blog-btn').on('click', function () {
                    const blogId = $(this).data('blog-id');
                    deleteBlogPost(blogId);
                });

                // Pagination logic (if needed)
                const totalPages = data.totalPages;
                // Example: Implement pagination UI or logic based on totalPages
            })
            .catch(error => console.error('Error fetching blog posts:', error));
    };

    // Function to delete a blog post by ID
    const deleteBlogPost = (blogId) => {
        if (confirm('Are you sure you want to delete this blog post?')) {
            fetch(`/api/blog/${blogId}`, {
                method: 'DELETE',
            })
            .then(response => {
                if (response.ok) {
                    alert('Blog post deleted successfully');
                    fetchBlogPosts(); // Refresh blog post list
                } else {
                    alert('Failed to delete blog post');
                }
            })
            .catch(error => {
                console.error('Error deleting blog post:', error);
                alert('Error deleting blog post');
            });
        }
    };

    // Fetch and display blog posts initially
    fetchBlogPosts();

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
                        <button onclick="showThanksPopup()">Thank</button>
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

    // Add event listener to download button
    $('#download-donors-btn').on('click', function () {
        window.location.href = '/download-donors';
    });
$('#download-volunteers-btn').on('click', function () {
        window.location.href = '/download-volunteers';
    });
    // Search functionality
    $('#search-btn').on('click', function () {
        const query = $('#search-input').val().trim();
        if (query) {
            fetch(`/api/search?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    // Clear existing results
                    $('#blogs-list').empty();
                    $('#volunteers-list').empty();
                    $('#donors-list').empty();

                    // Display search results
                    data.blogs.forEach(blog => {
                        const blogItem = `
                            <div class="card">
                                <h3>${blog.title}</h3>
                                <p>${blog.content}</p>
                                <p><strong>Author:</strong> ${blog.authorName}</p>
                                <p><strong>Date:</strong> ${blog.date}</p>
                                <button onclick="location.href='/blog-details?_id=${blog._id}'">Read More</button>
                                <button class="delete-blog-btn" data-blog-id="${blog._id}">Delete</button>
                            </div>`;
                        $('#blogs-list').append(blogItem);
                    });

                    data.volunteers.forEach(volunteer => {
                        const volunteerItem = `
                            <div class="card">
                                <p>Message: ${volunteer.message}</p>
                                <p><strong>Volunteer's Name:</strong>${volunteer.name}</p>                        
                            </div>`;
                        $('#volunteers-list').append(volunteerItem);
                    });

                    data.donors.forEach(donor => {
                        const donorItem = `
                            <div class="card">
                                <h3><strong>Name:</strong> ${donor.name}</h3>
                                <p><strong>D.O.B:</strong> ${donor.dob}</p>
                                <p><strong>Email:</strong> ${donor.email}</p>
                                <p><strong>Amount:</strong> ${donor.amount}</p>
                                <p><strong>Category:</strong> ${donor.category}</p>
                                <button onclick="showThanksPopup()">Thank</button>
                            </div>`;
                        $('#donors-list').append(donorItem);
                    });
                })
                .catch(error => console.error('Error fetching search results:', error));
        }
    });
});
