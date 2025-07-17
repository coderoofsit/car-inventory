const mongoose = require('mongoose');

const inspectionReportSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  inspectionDate: { type: Date, default: Date.now },
  overall_vehicle_details: {
    car_body: { type: String, default: '' },
    ac: { type: String, default: '' },
    electricals: { type: String, default: '' },
    drive_train: { type: String, default: '' },
    steering: { type: String, default: '' },
    brakes: { type: String, default: '' },
    suspension: { type: String, default: '' },
    engine: { type: String, default: '' },
    tyres: { type: String, default: '' },
    gas_fitment: { type: String, default: '' },
    fuel_tank_cap_leakage: { type: String, default: '' },
    fuel_lid_opening_closing: { type: String, default: '' },
    transmission: { type: String, default: '' }
  },
  engine: {
    starting_idling_behaviour: { type: String, default: '' },
    abnormal_noise: { type: String, default: '' },
    abnormal_noise_reason: { type: String, default: '' },
    leakages_oil_coolant: { type: String, default: '' },
    level_oil_coolant: { type: String, default: '' },
    contamination_oil_coolant: { type: String, default: '' },
    misfiring: { type: String, default: '' },
    coolant_condition: { type: String, default: '' },
    exhaust_smoke_color: { type: String, default: '' },
    over_heating: { type: String, default: '' },
    fuel: { type: String, default: '' },
    catalytic_converter_tail_pipe_condition: { type: String, default: '' },
    exhaust_noise_leak_damage: { type: String, default: '' },
    refurb_cost: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },
  brakes: {
    effectiveness: { type: String, default: '' },
    oil_level_leakage: { type: String, default: '' },
    hand_brake_operation: { type: String, default: '' },
    refurb_cost: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },
  electrical_system: {
    battery_condition: { type: String, default: '' },
    starter_operation: { type: String, default: '' },
    horn_operation: { type: String, default: '' },
    radiator_condensor_fans: { type: String, default: '' },
    all_warning_light_operation: { type: String, default: '' },
    wipers_operation: { type: String, default: '' },
    rear_defogger_system_functioning: { type: String, default: '' },
    ac_blower_motor_operation: { type: String, default: '' },
    lamps_head_fog_tail: { type: String, default: '' },
    turn_indicators: { type: String, default: '' },
    outside_rear_view_mirrors: { type: String, default: '' },
    power_windows_operation: { type: String, default: '' },
    music_system: { type: String, default: '' },
    cruise_control: { type: String, default: '' },
    pedal_shifting: { type: String, default: '' },
    remote_tail_gate_opener: { type: String, default: '' },
    key_less_entry: { type: String, default: '' },
    reverse_parking_sensor_camera: { type: String, default: '' },
    seat_positioning_adjustment: { type: String, default: '' },
    retrofitted_music_system: { type: String, default: '' },
    retrofitted_central_locking: { type: String, default: '' },
    retrofitted_power_windows: { type: String, default: '' },
    retrofitted_ac: { type: String, default: '' },
    refurb_cost: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },
  suspension: {
    noise_while_driving: { type: String, default: '' },
    oil_leakage: { type: String, default: '' },
    body_sagging: { type: String, default: '' },
    refurb_cost: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },
  steering: {
    steering_play: { type: String, default: '' },
    noise_while_driving: { type: String, default: '' },
    refurb_cost: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },
  tyres: {
    front_right: { type: String, default: '' },
    front_left: { type: String, default: '' },
    rear_right: { type: String, default: '' },
    rear_left: { type: String, default: '' },
    spare_tyre: { type: String, default: '' },
    refurb_cost: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },
  interior: {
    stains_wornout_faded_torn_cracked: { type: String, default: '' },
    refurb_cost: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },
  drive_train: {
    noise_while_driving: { type: String, default: '' },
    gear_shifting: { type: String, default: '' },
    clutch_operation: { type: String, default: '' },
    drive_shaft_cut_on_boot_surface_cracks: { type: String, default: '' },
    wheel_bearing_noise_while_driving: { type: String, default: '' },
    refurb_cost: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },
  fuel_ignition_system: {
    ignition_system_coil_leakage: { type: String, default: '' },
    fuel_system_fuel_injection_pumps_lines_leakage: { type: String, default: '' },
    refurb_cost: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },
  ac: {
    noise_from_ac_compressor_blower: { type: String, default: '' },
    ac_cooling: { type: String, default: '' },
    refurb_cost: { type: Number, default: 0 },
    remarks: { type: String, default: '' }
  },
  body: {
    front_bumper: { type: String, default: '' },
    back_bumper: { type: String, default: '' },
    bonnet: { type: String, default: '' },
    tail_gate: { type: String, default: '' },
    door_front_left: { type: String, default: '' },
    door_front_right: { type: String, default: '' },
    door_rear_left: { type: String, default: '' },
    door_rear_right: { type: String, default: '' },
    fender_front_left: { type: String, default: '' },
    fender_front_right: { type: String, default: '' },
    fender_rear_left: { type: String, default: '' },
    fender_rear_right: { type: String, default: '' },
    front_light: { type: String, default: '' },
    back_light: { type: String, default: '' },
    window_shield: { type: String, default: '' },
    pillars: { type: String, default: '' },
    mirrors: { type: String, default: '' },
    retrofitted_alloywheels: { type: String, default: '' },
    exterior_refurb_cost: { type: Number, default: 0 },
    exterior_remarks: { type: String, default: '' }
  },
  inspection_details: {
    inspection_report_created_by: { type: String, default: '' },
    certified_by_dealer: { type: String, default: '' },
    evaluation_report_note: { type: String, default: '' },
    date_of_evaluation: { type: String, default: '' },
    das_autoinspekt_id: { type: String, default: '' },
    page: { type: String, default: '' }
  }
}, { timestamps: true });

module.exports = mongoose.model('InspectionReport', inspectionReportSchema); 