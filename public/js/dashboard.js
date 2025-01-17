document.addEventListener('DOMContentLoaded', function () {
    const trendingPostsList = document.getElementById('trending-posts-list');
    const myPostsList = document.getElementById('my-posts-list');
    const newPostForm = document.getElementById('new-post-form');
  
    // Fetch and display trending posts
    fetch('/trending')
      .then(response => response.json())
      .then(posts => {
        posts.forEach(post => {
          const postDiv = document.createElement('div');
          postDiv.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
            <p>Author: ${post.author.username}</p>
            <p>Likes: ${post.likes}</p>
            <a href="${post.shareLink}">Share</a>
            <div>
              <h4>Comments:</h4>
              <div id="comments-${post._id}">
                ${post.comments.map(comment => `
                  <div>
                    <p>${comment.content}</p>
                    <p>Author: ${comment.author.username}</p>
                  </div>
                `).join('')}
              </div>
              <form class="comment-form" data-post-id="${post._id}">
                <input type="text" name="content" placeholder="Add a comment" required>
                <button type="submit">Comment</button>
              </form>
            </div>
          `;
          trendingPostsList.appendChild(postDiv);
        });
      });
  
    // Fetch and display user's posts
    fetch('/posts/my-posts')
      .then(response => response.json())
      .then(posts => {
        posts.forEach(post => {
          const postDiv = document.createElement('div');
          postDiv.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.content}</p>
            ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
            <p>Author: ${post.author.username}</p>
            <p>Likes: ${post.likes}</p>
            <a href="${post.shareLink}">Share</a>
            <div>
              <h4>Comments:</h4>
              <div id="comments-${post._id}">
                ${post.comments.map(comment => `
                  <div>
                    <p>${comment.content}</p>
                    <p>Author: ${comment.author.username}</p>
                  </div>
                `).join('')}
              </div>
              <form class="comment-form" data-post-id="${post._id}">
                <input type="text" name="content" placeholder="Add a comment" required>
                <button type="submit">Comment</button>
              </form>
            </div>
          `;
          myPostsList.appendChild(postDiv);
        });
      });
  
    // Handle new post submission
    newPostForm.addEventListener('submit', function (event) {
      event.preventDefault();
  
      const formData = new FormData(newPostForm);
      const data = Object.fromEntries(formData.entries());
  
      fetch('/posts/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => response.json())
      .then(post => {
        const postDiv = document.createElement('div');
        postDiv.innerHTML = `
          <h3>${post.title}</h3>
          <p>${post.content}</p>
          ${post.image ? `<img src="${post.image}" alt="${post.title}">` : ''}
          <p>Author: ${post.author.username}</p>
          <p>Likes: ${post.likes}</p>
          <a href="${post.shareLink}">Share</a>
          <div>
            <h4>Comments:</h4>
            <div id="comments-${post._id}"></div>
            <form class="comment-form" data-post-id="${post._id}">
              <input type="text" name="content" placeholder="Add a comment" required>
              <button type="submit">Comment</button>
            </form>
          </div>
        `;
        myPostsList.appendChild(postDiv);
        newPostForm.reset();
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  
    // Handle comment submission
    document.addEventListener('submit', function (event) {
      if (event.target.classList.contains('comment-form')) {
        event.preventDefault();
  
        const form = event.target;
        const postId = form.getAttribute('data-post-id');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
  
        fetch(`/posts/${postId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(post => {
          const commentsDiv = document.getElementById(`comments-${post._id}`);
          commentsDiv.innerHTML = post.comments.map(comment => `
            <div>
              <p>${comment.content}</p>
              <p>Author: ${comment.author.username}</p>
            </div>
          `).join('');
          form.reset();
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
    });
  });
  