import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Text } from '@/components/atoms/Text';

// Organism: 여러 Atom/Molecule을 조합한 페이지 상단 영역
export function PageHeader() {
  return (
    <header className="stack">
      <div className="row">
        <h1 className="page-title">Atomic Design · Demo</h1>
        <Badge variant="primary">Design System</Badge>
      </div>
      <Text muted>
        Atomic Design 계층(atoms → molecules → organisms → templates →
        pages)이 어떻게 실제 UI 구조로 이어지는지 보여주는 작은 예제입니다.
      </Text>
      <div className="row">
        <Badge variant="muted">atoms / molecules / organisms / templates</Badge>
        <Button
          variant="ghost"
          size="small"
          onClick={() => {
            // 단순 데모용, 비즈니스 로직 없음
            // eslint-disable-next-line no-alert
            alert('이 데모는 디자인 시스템 구조를 설명하기 위한 예제입니다.');
          }}
        >
          구조 설명 보기
        </Button>
      </div>
    </header>
  );
}

