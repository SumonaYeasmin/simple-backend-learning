import { Controller, Get, Param } from '@nestjs/common';
import { PostsService } from './posts.service.js';

@Controller('posts')
export class PostsController {
     constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts() {
    return this.postsService.createPost();
  }

  @Get('user/:id')
getUserWithPosts(@Param('id') id: string) {
  return this.postsService.getUserWithPosts(Number(id));
}
@Get('connect')
createPostWithConnect() {
  return this.postsService.createPostWithConnect();
}
@Get('nested-create')
createUserWithPost() {
  return this.postsService.createUserWithPost();
}

}
