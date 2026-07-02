const SERVICE_IMAGES = {
  'ac-service-repair': '/images/services/ac-service-repair.jpg',
  'deep-home-cleaning': '/images/services/deep-home-cleaning.jpg',
  'sofa-carpet-shampooing': '/images/services/sofa-carpet-shampooing.jpg',
  'house-painting': '/images/services/house-painting.jpg',
  'washing-machine-repair': '/images/services/washing-machine-repair.jpg',
  'refrigerator-repair': '/images/services/refrigerator-repair.jpg',
  'salon-at-home-women': '/images/services/salon-at-home-women.jpg',
  'massage-therapy': '/images/services/massage-therapy.jpg',
  'electrician-on-call': '/images/services/electrician-on-call.jpg',
  'plumbing-services': '/images/services/plumbing-services.jpg',
  'cctv-installation': '/images/services/cctv-installation.jpg',
  'cockroach-ant-control': '/images/services/cockroach-ant-control.jpg',
  'termite-treatment': '/images/services/termite-treatment.jpg',
};

export function getServiceImage(slug) {
  return SERVICE_IMAGES[slug] || '/images/services/deep-home-cleaning.jpg';
}
