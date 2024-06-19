// blog.js

document.addEventListener('DOMContentLoaded', function () {

    // Function to fetch and display blog details
    function fetchBlogDetails() {
        const params = new URLSearchParams(window.location.search);
        const blogId = params.get('_id');

        if (blogId) {
            fetch(`/api/blog/${blogId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Error fetching blog details');
                    }
                    return response.json();
                })
                .then(data => {
                    displayBlogDetails(data);
                })
                .catch(error => {
                    console.error('Error fetching blog details:', error);
                    alert('Failed to fetch blog details');
                });
        } else {
            alert('Blog ID not provided');
        }
    }

    // Function to display blog details on blog-details.html
    function displayBlogDetails(data) {
        document.getElementById('blog-title').textContent = data.title;
        document.getElementById('blog-author').textContent = `By ${data.authorName}`;
        document.getElementById('blog-date').textContent = `Published on ${new Date(data.date).toLocaleDateString()}`;
        document.getElementById('blog-content').textContent = data.content;
        document.getElementById('blog-picture').setAttribute('src', data.picture);
    }

    // Function to fetch and display list of blogs
    function fetchBlogList() {
        const blogList = document.getElementById('blog-list');
        const pagination = document.getElementById('pagination');
        const perPage = 10; // Number of blogs per page
        let currentPage = 1; // Current page

        fetch(`/api/blogs-list?page=${currentPage}&perPage=${perPage}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error fetching blog posts');
                }
                return response.json();
            })
            .then(data => {
                displayBlogList(data.blogs);
                renderPagination(data.totalPages, currentPage);
            })
            .catch(error => {
                console.error('Error fetching blog posts:', error);
                alert('Failed to fetch blog posts');
            });

        // Function to display list of blogs on blog-posts.html
        function displayBlogList(blogs) {
            blogList.innerHTML = '';
            if (!blogs || blogs.length === 0) {
                blogList.innerHTML = '<p>No blogs found.</p>';
                return;
            }
            blogs.forEach(blog => {
                const blogItem = `
                    <div class="card">
                        <h3>${blog.title}</h3>
                        <img src="${blog.picture}" alt="Blog Image">
                        <p>${blog.content.substring(0, 150)}...</p>
                        <button class="read-more-btn" onclick="location.href='/blog-details?_id=${blog._id}'">Read More</button>
                    </div>`;
                blogList.innerHTML += blogItem;
            });
        }

        // Function to render pagination links
        function renderPagination(totalPages, currentPage) {
            pagination.innerHTML = '';
            if (totalPages <= 1) {
                return;
            }
            for (let i = 1; i <= totalPages; i++) {
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = i;
                link.addEventListener('click', function (event) {
                    event.preventDefault();
                    currentPage = i;
                    fetch(`/api/blogs-list?page=${currentPage}&perPage=${perPage}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error('Error fetching blog posts');
                            }
                            return response.json();
                        })
                        .then(data => {
                            displayBlogList(data.blogs);
                            renderPagination(data.totalPages, currentPage);
                        })
                        .catch(error => {
                            console.error('Error fetching blog posts:', error);
                            alert('Failed to fetch blog posts');
                        });
                });
                if (i === currentPage) {
                    link.style.backgroundColor = '#007bff';
                    link.style.color = 'white';
                }
                pagination.appendChild(link);
            }
        }
    }

    // Determine which page is currently loaded
    if (document.getElementById('blog-list')) {
        fetchBlogList();
    } else if (document.getElementById('blog-title')) {
        fetchBlogDetails();
    }
  
});
