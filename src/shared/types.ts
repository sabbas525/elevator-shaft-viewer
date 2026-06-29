export interface Shaft {
  id: number;
  name: string;
  address: string | null;
  floors: number;
}

export interface Component {
  id: number;
  shaft_id: number;
  name: string;
  type: 'door' | 'guide_rail' | 'car' | 'cable';
  mesh_name: string | null;
  condition: 'good' | 'fair' | 'poor';
  next_inspection: string | null;
}

export interface Inspection {
  id: number;
  component_id: number;
  date: string;
  condition: string;
  notes: string | null;
}

export interface ShaftDetail extends Shaft {
  components: Component[];
}
