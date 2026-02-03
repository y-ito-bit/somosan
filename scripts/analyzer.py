import os
import json
from googleapiclient.discovery import build
import google.generativeai as genai
from supabase import create_client, Client
from dotenv import load_dotenv

# 環境変数の読み込み
load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# クライアントの初期化
youtube = build("youtube", "v3", developerKey=YOUTUBE_API_KEY)
genai.configure(api_key=GEMINI_API_KEY)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def get_video_metadata(video_id):
    """YouTube動画のメタデータ（タイトル、サムネイル）を取得する"""
    try:
        request = youtube.videos().list(
            part="snippet",
            id=video_id
        )
        response = request.execute()
        if not response.get("items"):
            return None
        
        snippet = response["items"][0]["snippet"]
        return {
            "title": snippet["title"],
            "thumbnail_url": snippet["thumbnails"]["high"]["url"]
        }
    except Exception as e:
        print(f"Error fetching metadata: {e}")
        return None

def get_video_comments(video_id, max_results=100):
    """YouTube動画のコメントを取得する"""
    comments = []
    try:
        request = youtube.commentThreads().list(
            part="snippet",
            videoId=video_id,
            maxResults=max_results,
            textFormat="plainText"
        )
        response = request.execute()

        for item in response.get("items", []):
            comment = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
            comments.append(comment)
        
        return comments
    except Exception as e:
        print(f"Error fetching comments: {e}")
        return []

def analyze_comments_with_gemini(comments):
    """Geminiを使用してKJ法でコメントを分析する (ソモさんペルソナ版)"""
    if not comments:
        return None

    model = genai.GenerativeModel("gemini-flash-latest")
    
    prompt = f"""
【ソモさん流・爆裂議論誘発プロンプト】
あなたはYouTubeチャンネル「金曜日のソモさん情報局」の主役、ソモさんだ！ エネルギッシュで頼れる兄貴分として、視聴者のコメントをKJ法で分析し、さらなる議論を巻き起こす要約をブチかましてくれ！

【ソモさんの鉄則】
1. 語尾は「〜だぜ！」「〜だ！」「〜してくれよな！」を徹底。
2. 堅苦しい表現や冗長な解説は一切禁止！勢いと魂で語れ！
3. 誹謗中傷、卑猥な表現、公序良俗に反するコメントは完全に除外しろ！
4.視聴者の熱量がそのまま伝わるような、勢いのある言葉を使ってくれ！
5.番組に対する褒め言葉・改善などは今回のKJ法の対象外だぜ！

【分析・構成ルール】 以下の比率と内容で、KJ法に基づいたグルーピングを行え！
- 【感想：ポジティブ】（1枠）：動画の構成や演出、内容への純粋な称賛だ！
- 【議論：学生への視点】（1枠）：登場した学生の姿勢や意見に対し、大人の視点や経験をぶつける内容だ！
- 【議論：コーディネーター深掘り】（2枠）：コーディネーターの発言を起点に、さらに思考を広げる議論だ！
- 【議論：社会・未来への波及】（1枠）：このテーマが社会全体にどう繋がるか、一歩先を考える議論だ！
- 【提案：次へのアクション】（1枠）：視聴者が学生に対して「次はこうすべき」「これを調べてくれ」と提案する内容だ！

【出力項目】
- category_name: 全員が飛びつきたくなる爆裂キャッチーな見出し！
- summary: そのグループが何を語っているか、議論を煽るような熱い要約！
- representative_comments: 熱量を象徴するコメントを3〜5件、20〜40文字程度で魂を込めて要約しろ！

【出力フォーマット（JSONのみ。余計な説明は省くこと）】
{{
  "total_analysis": "動画全体を振り返り、今すぐ議論を始めたくなる熱い総括だぜ！",
  "groups": [
    {{
      "category_name": "爆裂インパクトのあるカテゴリ名",
      "summary": "１~２行で短くまとめた要約だ！",
      "representative_comments": [
        "要約された生の声1だぜ！",
        "要約された生の声2だぜ！"
      ]
    }}
  ]
}}

【対象コメント】
{chr(10).join(comments)}
"""

    try:
        response = model.generate_content(prompt)
        content = response.text.strip()
        
        # JSON部分の抽出 (Markdownのコードブロックがあれば除去)
        if "```json" in content:
            content = content.split("```json")[-1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[-1].split("```")[0].strip()
            
        return json.loads(content)
    except Exception as e:
        print(f"Error analyzing with Gemini: {e}")
        return None

def save_to_supabase(video_id, metadata, analysis_result):
    """分析結果をSupabaseに保存する"""
    try:
        # 1. Videoの保存/更新
        video_data = {
            "youtube_id": video_id,
            "title": metadata["title"],
            "thumbnail_url": metadata["thumbnail_url"],
            "total_analysis": analysis_result["total_analysis"]
        }
        
        # upsertを使用 (youtube_idがUNIQUE設定であることを前提)
        res = supabase.table("videos").upsert(video_data, on_conflict="youtube_id").execute()
        db_video_id = res.data[0]["id"]
        
        # 2. 既存の分析グループを削除（再分析の場合）
        supabase.table("analysis_groups").delete().eq("video_id", db_video_id).execute()
        
        # 3. 分析グループの保存
        groups_data = []
        for i, group in enumerate(analysis_result["groups"]):
            groups_data.append({
                "video_id": db_video_id,
                "category_name": group["category_name"],
                "summary": group["summary"],
                "representative_comments": group.get("representative_comments", []),
                "display_order": i
            })
            
        supabase.table("analysis_groups").insert(groups_data).execute()
        return True
    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        return False

def main(video_id):
    print(f"--- 分析開始: {video_id} ---")
    
    # 1. メタデータ取得
    print("動画情報を取得中...")
    metadata = get_video_metadata(video_id)
    if not metadata:
        print("動画情報が見つかりませんでした。")
        return

    # 2. コメント取得
    print(f"「{metadata['title']}」のコメントを取得中...")
    comments = get_video_comments(video_id)
    print(f"{len(comments)} 件のコメントを取得しました。")
    
    if not comments:
        print("分析対象のコメントが見つかりませんでした。")
        return

    # 3. AI分析
    print("Geminiで分析を実行中...")
    analysis_result = analyze_comments_with_gemini(comments)
    
    if analysis_result:
        # 4. Supabaseに保存
        print("分析結果をSupabaseに保存中...")
        if save_to_supabase(video_id, metadata, analysis_result):
            print(f"成功！Supabaseへの保存が完了しました。")
        else:
            print("Supabaseへの保存に失敗しました。")
    else:
        print("分析に失敗しました。")

if __name__ == "__main__":
    import sys
    target_id = sys.argv[1] if len(sys.argv) > 1 else "9fkFPabCce8"
    main(target_id)
