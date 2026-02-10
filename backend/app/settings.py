from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # 모델 서버의 "완전한" 엔드포인트 URL
    # 예: https://api.xxx.com/api/v1/analyze/sms
    model_url: str

    request_timeout_seconds: float = 30.0
    allowed_origins: str = "*"  # 개발용: "*" 권장, 배포 시 도메인으로 제한

    class Config:
        env_file = ".env"
        extra = "ignore"

    def allowed_origins_list(self):
        if self.allowed_origins.strip() == "*":
            return ["*"]
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]

settings = Settings()
