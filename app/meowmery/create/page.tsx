import { Metadata } from 'next';
import PostForm from '../../components/PostForm';

export const metadata: Metadata = {
  title: 'Share a Memory - Meowmery',
  description: 'Share a precious memory of your beloved cat.',
};

export default function CreatePost() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Share a Memory
      </h1>
      <PostForm />
    </div>
  );
} 