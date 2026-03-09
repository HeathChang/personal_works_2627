import { Badge } from '@/components/atoms/Badge';
import { Text } from '@/components/atoms/Text';
import { CardHeader } from '@/components/molecules/CardHeader';
import { StatItem } from '@/components/molecules/StatItem';

// Organism: Atomic Design 개념을 설명하는 카드
export function AtomicSummaryCard() {
  return (
    <section className="card">
      <CardHeader
        title="Atomic Design 계층"
        subtitle="UI를 원자 단위로 쪼개고 다시 조립해서 일관된 디자인 시스템을 만듭니다."
        aside={<Badge variant="muted">theory</Badge>}
      />
      <div className="card-body">
        <ul className="list-reset" style={{ display: 'grid', gap: '0.6rem' }}>
          <StatItem
            label="Atoms"
            value="버튼, 텍스트, 뱃지 등 가장 작은 단위"
            description="재사용 가능하고 문맥에 독립적인 UI 요소"
          />
          <StatItem
            label="Molecules"
            value="Card 헤더, 통계 아이템 등 소규모 조합"
            description="여러 Atom이 함께 동작하도록 만든 컴포넌트"
          />
          <StatItem
            label="Organisms"
            value="페이지 헤더, 요약 카드 등 특정 섹션"
            description="여러 Molecule과 Atom을 조합한 뚜렷한 영역"
          />
          <StatItem
            label="Templates"
            value="페이지 레이아웃 구조"
            description="어떤 Organism들이 어떤 순서/레이아웃으로 배치되는지 정의"
          />
          <StatItem
            label="Pages"
            value="실제 데이터가 들어간 최종 화면"
            description="템플릿에 실제 콘텐츠와 데이터를 채워 넣은 결과물"
          />
        </ul>
        <Text as="small" muted>
          이 예제 프로젝트는 위 계층을 코드 구조와 컴포넌트로 1:1 매핑해서
          보여줍니다.
        </Text>
      </div>
    </section>
  );
}

