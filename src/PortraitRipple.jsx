import { Component, useEffect, useState } from 'react';
import RippleDistortion from './RippleDistortion';

class RippleBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

export default function PortraitRipple() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const probe = document.createElement('canvas');
    const context = probe.getContext('webgl2') || probe.getContext('webgl');
    const supported = Boolean(context);
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    const update = () => setEnabled(supported && !motion.matches);
    update();
    motion.addEventListener('change', update);
    return () => motion.removeEventListener('change', update);
  }, []);
  return <>
    <img src="/images/liu-nian.jpg" alt="刘念在水边的个人照片" width={1079} height={1616} decoding="async" fetchPriority="high" />
    {enabled && <RippleBoundary><div className="portrait-ripple" aria-hidden="true">
      <RippleDistortion src="/images/liu-nian.jpg" brushSize={70} strength={0.035}
        swirl={1} rings={2.25} grayscale={false} tintAmount={0} quality="high" fade={2.5} spacing={31} />
    </div></RippleBoundary>}
  </>;
}
