import 'fluent-ffmpeg';

declare module 'fluent-ffmpeg' {
    interface FfmpegCommand {
        on: (status: string, callback: (value: any) => void) => FfmpegCommand;
    }
}
