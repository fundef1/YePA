import { getAssetPath } from '../utils/pathUtils';

interface ProfileImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProfileImage = ({ src, alt, className }: ProfileImageProps) => {
  return (
    <img 
      src={getAssetPath(src)} 
      alt={alt}
      className={className}
    />
  );
};