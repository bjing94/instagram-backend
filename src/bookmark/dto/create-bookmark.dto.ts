import Account from 'src/entities/account.entity';
import Post from 'src/entities/post.entity';

export default class CreateBookmarkDto {
  user: Account;
  post: Post;
}
