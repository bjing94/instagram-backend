import Account from 'src/entities/account.entity';

export default class CreatePostDto {
  user: Account;
  description?: string;
  images?: string;
}
