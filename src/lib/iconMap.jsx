import { Shirt, Bag, Hanger, Dress, Shoe, Sparkle } from "../components/Icons.jsx";

const map = { shirt: Shirt, bag: Bag, hanger: Hanger, dress: Dress, shoe: Shoe, sparkle: Sparkle };

export function GarmentIcon({ name, ...rest }) {
  const Cmp = map[name] || Hanger;
  return <Cmp {...rest} />;
}
