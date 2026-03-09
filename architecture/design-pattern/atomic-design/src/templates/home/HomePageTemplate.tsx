import { PageHeader } from '@/components/organisms/PageHeader';
import { AtomicSummaryCard } from '@/components/organisms/AtomicSummaryCard';
import { Badge } from '@/components/atoms/Badge';
import { Text } from '@/components/atoms/Text';

// Template: 페이지의 레이아웃/구조를 정의하는 컴포넌트
// - 어떤 Organism들이 어떤 레이아웃으로 배치될지에만 관심이 있습니다.
export function HomePageTemplate() {
  return (
    <main>
      <div className="container stack">
        <PageHeader />

        <section className="layout-two-columns">
          <AtomicSummaryCard />

          <section className="card">
            <header className="card-header">
              <div>
                <h2 className="card-title">이 예제가 보여주는 것</h2>
                <p className="card-subtitle">
                  디자인 패턴(Atomic Design)을 코드 구조와 SRP 관점에서 어떻게
                  옮길 수 있는지에 집중합니다.
                </p>
              </div>
              <Badge variant="primary">SRP</Badge>
            </header>
            <div className="card-body stack">
              <Text as="p">
                이 템플릿은 &quot;어떤 섹션이 어디에 배치되는지&quot; 만 알고
                있으며, 각 섹션 내부의 세부 구현은 Organism/Molecule/Atom이
                담당합니다.
              </Text>
              <ul className="list-reset" style={{ fontSize: '0.9rem' }}>
                <li>
                  <strong>PageHeader</strong>: 페이지 상단 설명 영역 (organism)
                </li>
                <li>
                  <strong>AtomicSummaryCard</strong>: Atomic Design 계층
                  설명(organism)
                </li>
                <li>
                  <strong>HomePageTemplate</strong>: 위 두 organism 을
                  배치하는 레이아웃(template)
                </li>
              </ul>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

