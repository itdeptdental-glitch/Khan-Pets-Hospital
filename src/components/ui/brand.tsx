import Image from 'next/image'
export function Brand() {
 return <div className="brand"><Image src="/logo.jpg" alt="Khan Pets Hospital logo" width={48} height={48} className="brand-hospital-logo"/><div><strong>Khan Pets Hospital</strong><small>Rahim Yar Khan</small></div></div>
}
