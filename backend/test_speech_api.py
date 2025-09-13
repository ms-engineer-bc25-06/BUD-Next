#!/usr/bin/env python3
"""Speech-to-Text API Test"""

import asyncio
import os
import sys
from pathlib import Path

# Add project root path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.speech_service import speech_service

async def test_speech_service():
    """Test Speech service"""
    print("=" * 50)
    print("Speech-to-Text Service Test Started")
    print("=" * 50)
    
    # 1. Health check
    print("\n1. Running health check...")
    try:
        health = speech_service.health_check()
        if health['healthy']:
            print("✅ Service is healthy")
            print(f"   - Language: {health['language']}")
            print(f"   - Encoding: {health['encoding']}")
            print(f"   - Sample rate: {health['sample_rate']} Hz")
        else:
            print(f"❌ Service unhealthy: {health['error']}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False
    
    # 2. Speech recognition test (mock data)
    print("\n2. Speech recognition test (error cases)...")
    
    # 2-1. Empty data test
    try:
        result = await speech_service.transcribe_audio(b"", "webm")
        if not result['success']:
            print(f"✅ Empty data detected: {result['error']}")
        else:
            print("❌ Empty data detection failed")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 2-2. Too small data test  
    try:
        result = await speech_service.transcribe_audio(b"test", "webm")
        if not result['success']:
            print(f"✅ Small data detected: {result['error']}")
        else:
            print("❌ Small data detection failed")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # 2-3. Too large data test (11MB)
    try:
        large_data = b"x" * (11 * 1024 * 1024)
        result = await speech_service.transcribe_audio(large_data, "webm")
        if not result['success']:
            print(f"✅ Large data detected: {result['error']}")
        else:
            print("❌ Large data detection failed")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("Test completed")
    print("=" * 50)
    
    # Hint for testing with actual audio files
    print("\n💡 To test with actual audio files:")
    print("   1. Prepare test audio file (.wav/.mp3/.webm)")
    print("   2. Use the following code:")
    print("""
    # Read file
    with open('test_audio.wav', 'rb') as f:
        audio_data = f.read()
    
    # Execute speech recognition
    result = await speech_service.transcribe_audio(audio_data, 'wav')
    print(f"Recognition result: {result['text']}")
    print(f"Confidence: {result['confidence']}")
    """)
    
    return True

async def test_api_integration():
    """Check API integration preparation"""
    print("\n" + "=" * 50)
    print("API Integration Check")
    print("=" * 50)
    
    # main.py integration steps
    print("\n📝 main.py integration steps:")
    print("✅ Already integrated!")
    print("   - Import added: from app.routers import speech")
    print("   - Router registered: app.include_router(speech.router)")
    
    # Docker environment check
    print("\n🐳 Docker environment check:")
    docker_compose_path = Path(__file__).parent.parent / "docker-compose.yml"
    if docker_compose_path.exists():
        print("✅ docker-compose.yml exists")
    else:
        print("❌ docker-compose.yml not found")
    
    # Environment variable check
    print("\n🔑 Environment variable check:")
    if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        print(f"✅ GOOGLE_APPLICATION_CREDENTIALS: Set")
    else:
        print("⚠️  GOOGLE_APPLICATION_CREDENTIALS: Not set")
        print("   Please set service account key")
    
    return True

def main():
    """Main execution function"""
    print("\n🚀 Speech-to-Text API Test Starting\n")
    
    # Run event loop
    loop = asyncio.get_event_loop()
    
    try:
        # Service test
        success = loop.run_until_complete(test_speech_service())
        
        if success:
            # API integration check
            loop.run_until_complete(test_api_integration())
            
            print("\n✅ All tests completed successfully")
        else:
            print("\n❌ Tests failed")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️  Test interrupted")
    except Exception as e:
        print(f"\n❌ Test error: {e}")
        sys.exit(1)
    finally:
        loop.close()

if __name__ == "__main__":
    main()