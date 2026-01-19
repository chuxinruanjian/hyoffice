import {
  Controller,
  Post,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// 图片存储配置
const imageStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'images');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `${timestamp}_${random}${ext}`);
  },
});

// 文件存储配置
const fileStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'files');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `${timestamp}_${random}${ext}`);
  },
});

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 上传单张图片
   * POST /upload/image
   */
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: imageStorage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `不支持的图片格式，允许：${allowedTypes.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的图片');
    }

    return {
      originalName: file.originalname,
      fileName: file.filename,
      path: `/uploads/images/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * 上传多张图片（最多10张）
   * POST /upload/images
   */
  @Post('images')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: imageStorage,
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `不支持的图片格式，允许：${allowedTypes.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  uploadImages(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的图片');
    }

    return files.map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      path: `/uploads/images/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));
  }

  /**
   * 上传单个文件
   * POST /upload/file
   */
  @Post('file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: fileStorage,
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          '.jpg',
          '.jpeg',
          '.png',
          '.gif',
          '.webp',
          '.svg',
          '.pdf',
          '.doc',
          '.docx',
          '.xls',
          '.xlsx',
          '.ppt',
          '.pptx',
          '.txt',
          '.zip',
          '.rar',
          '.7z',
        ];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `不支持的文件格式，允许：${allowedTypes.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('请选择要上传的文件');
    }

    return {
      originalName: file.originalname,
      fileName: file.filename,
      path: `/uploads/files/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * 上传多个文件（最多10个）
   * POST /upload/files
   */
  @Post('files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: fileStorage,
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          '.jpg',
          '.jpeg',
          '.png',
          '.gif',
          '.webp',
          '.svg',
          '.pdf',
          '.doc',
          '.docx',
          '.xls',
          '.xlsx',
          '.ppt',
          '.pptx',
          '.txt',
          '.zip',
          '.rar',
          '.7z',
        ];
        const ext = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `不支持的文件格式，允许：${allowedTypes.join(', ')}`,
            ),
            false,
          );
        }
      },
    }),
  )
  uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('请选择要上传的文件');
    }

    return files.map((file) => ({
      originalName: file.originalname,
      fileName: file.filename,
      path: `/uploads/files/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));
  }

  /**
   * 删除文件
   * DELETE /upload
   */
  @Delete()
  async deleteFile(@Body('path') filePath: string) {
    if (!filePath) {
      throw new BadRequestException('请提供文件路径');
    }

    // 安全检查：只允许删除 uploads 目录下的文件
    if (!filePath.startsWith('/uploads/')) {
      throw new BadRequestException('无效的文件路径');
    }

    const result = await this.uploadService.deleteFile(filePath);
    return {
      success: result,
      message: result ? '文件删除成功' : '文件不存在或删除失败',
    };
  }
}
