// // public/scripts/post.js
// document.addEventListener('DOMContentLoaded', async () => {
//     const postId = window.location.pathname.split('/').pop();
    
//     try {
//         const response = await fetch(`/posts/${postId}`);
//         if (!response.ok) throw new Error('Post not found');
//         const post = await response.json();
        
//         document.getElementById('post-title').textContent = post.title;
//         document.getElementById('post-image').src = post.image || 'default-image.png';
//         document.getElementById('post-content').textContent = post.content;
        
//         // Handle like button
//         document.getElementById('like-button').addEventListener('click', () => {
//             // Implement like functionality here
//         });
        
//         // Handle comment submission
//         document.getElementById('submit-comment').addEventListener('click', async () => {
//             const commentContent = document.getElementById('comment-input').value;
//             // Implement comment submission here
//         });
//     } catch (error) {
//         console.error('Error fetching post:', error);
//     }
// });





// async function toggleLike(postId) {
//     try {
//       const response = await fetch(`/posts/like/${postId}`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
  
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
  
//       const data = await response.json();
//       document.getElementById(`like-count-${postId}`).innerText = data.likes;
//     } catch (error) {
//       console.error('Error liking the post:', error);
//     }
//   }
  