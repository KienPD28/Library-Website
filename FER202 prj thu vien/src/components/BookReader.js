import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BookReader = ({ uid, bookTitle }) => {
  const [bookContent, setBookContent] = useState('');

  useEffect(() => {
    const fetchBookContent = async () => {
      try {
        const response = await axios.get('/api/book/read', {
          params: { uid, title: bookTitle }
        });
        setBookContent(response.data);
      } catch (error) {
        console.error('Error fetching book content', error);
      }
    };

    fetchBookContent();
  }, [uid, bookTitle]);

  return (
    <div>
      <h1>{bookTitle}</h1>
      <pre>{bookContent}</pre>
    </div>
  );
};

export default BookReader;
