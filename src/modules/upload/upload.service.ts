import { Injectable, BadRequestException } from '@nestjs/common';
import { join, extname } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

// 允许的图片类型
const ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
// 允许的文件类型
const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
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

// 文件大小限制（字节）
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Injectable()
export class UploadService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    // 确保上传目录存在
    this.ensureDir(this.uploadDir);
    this.ensureDir(join(this.uploadDir, 'images'));
    this.ensureDir(join(this.uploadDir, 'files'));
  }

  /**
   * 确保目录存在
   */
  private ensureDir(dir: string) {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 生成唯一文件名
   */
  private generateFileName(originalName: string): string {
    const ext = extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}_${random}${ext}`;
  }

  /**
   * 验证图片文件
   */
  validateImage(file: Express.Multer.File): void {
    const ext = extname(file.originalname).toLowerCase();

    if (!ALLOWED_IMAGE_TYPES.includes(ext)) {
      throw new BadRequestException(
        `不支持的图片格式，允许的格式：${ALLOWED_IMAGE_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_IMAGE_SIZE) {
      throw new BadRequestException(
        `图片大小不能超过 ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * 验证普通文件
   */
  validateFile(file: Express.Multer.File): void {
    const ext = extname(file.originalname).toLowerCase();

    if (!ALLOWED_FILE_TYPES.includes(ext)) {
      throw new BadRequestException(
        `不支持的文件格式，允许的格式：${ALLOWED_FILE_TYPES.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `文件大小不能超过 ${MAX_FILE_SIZE / 1024 / 1024}MB`,
      );
    }
  }

  /**
   * 上传图片
   */
  uploadImage(file: Express.Multer.File) {
    this.validateImage(file);

    const fileName = this.generateFileName(file.originalname);
    const relativePath = `/uploads/images/${fileName}`;

    // 返回同步对象
    return {
      originalName: file.originalname,
      fileName,
      path: relativePath,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * 上传多张图片
   */
  uploadImages(files: Express.Multer.File[]) {
    // 返回同步处理
    return files.map((file) => this.uploadImage(file));
  }

  /**
   * 上传文件
   */
  uploadFile(file: Express.Multer.File) {
    this.validateFile(file);

    const fileName = this.generateFileName(file.originalname);
    const relativePath = `/uploads/files/${fileName}`;

    // 返回同步对象
    return {
      originalName: file.originalname,
      fileName,
      path: relativePath,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  /**
   * 上传多个文件
   */
  uploadFiles(files: Express.Multer.File[]) {
    // 返回同步处理
    return files.map((file) => this.uploadFile(file));
  }

  /**
   * 删除文件
   */
  deleteFile(filePath: string): boolean {
    try {
      const fullPath = join(process.cwd(), filePath);
      if (existsSync(fullPath)) {
        unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * 获取允许的图片类型
   */
  getAllowedImageTypes() {
    return ALLOWED_IMAGE_TYPES;
  }

  /**
   * 获取允许的文件类型
   */
  getAllowedFileTypes() {
    return ALLOWED_FILE_TYPES;
  }
}
