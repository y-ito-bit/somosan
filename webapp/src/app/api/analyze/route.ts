import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { videoId } = body;

        if (!videoId) {
            return NextResponse.json(
                { message: 'Video ID is required' },
                { status: 400 }
            );
        }

        // スクリプトのパスを解決
        // process.cwd() は webapp ディレクトリを指す想定
        const scriptPath = path.resolve(process.cwd(), '../scripts/analyzer.py');

        // Python実行コマンド
        // 環境に合わせて python3 または python を使用
        const command = `python3 "${scriptPath}" ${videoId}`;

        console.log(`Executing command: ${command}`);

        return new Promise<NextResponse>((resolve) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Exec error: ${error}`);
                    console.error(`Stderr: ${stderr}`);
                    resolve(
                        NextResponse.json(
                            {
                                message: 'Analysis failed',
                                error: error.message,
                                details: stderr
                            },
                            { status: 500 }
                        )
                    );
                    return;
                }

                console.log(`Stdout: ${stdout}`);
                resolve(
                    NextResponse.json({
                        message: 'Analysis completed successfully',
                        output: stdout
                    })
                );
            });
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
