import { useState } from "react";

const useComment = () => {
  const [comments, setComments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = async (productId) => {
    try {
      const response = await fetch(`http://localhost:3001/comments?productId=${productId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  const addComment = async (commentData) => {
    setIsSubmitting(true);
    try {
      // Lấy thông tin người dùng từ localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        throw new Error("User not logged in");
      }

      // Thêm avatar từ imageUrl của người dùng vào comment
      const commentWithAvatar = {
        ...commentData,
        avatar: user.imageUrl || null, // Sử dụng imageUrl nếu có, nếu không thì null
      };

      const response = await fetch("http://localhost:3001/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentWithAvatar),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prevComments) => [...prevComments, newComment]);
        return true;
      } else {
        console.error("Failed to add comment");
        return false;
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    comments,
    isSubmitting,
    fetchComments,
    addComment,
  };
};

export default useComment;