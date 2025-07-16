export const vehicleInspectionSchema = {
  overall_vehicle_details: {
    car_body: ["Excellent", "Very Good", "Good", "Average", "Poor"],
    ac: ["Excellent", "Very Good", "Good", "Average", "Poor"],
    electricals: ["Excellent", "Very Good", "Good", "Average", "Poor"],
    drive_train: ["Excellent", "Very Good", "Good", "Average", "Poor"],
    steering: ["Excellent", "Very Good", "Good", "Average", "Poor"],
    brakes: ["Excellent", "Very Good", "Good", "Average", "Poor"],
    suspension: ["Excellent", "Very Good", "Good", "Average", "Poor"],
    engine: ["Excellent", "Very Good", "Good", "Average", "Poor"],
    tyres: ["Excellent", "Very Good", "Good", "Average", "Poor"],
    gas_fitment: ["Yes", "No"],
    fuel_tank_cap_leakage: ["Yes", "No"],
    fuel_lid_opening_closing: ["Yes", "No"],
    transmission: ["Manual", "Automatic", "CVT", "Semi-Automatic"]
  },
  engine: {
    starting_idling_behaviour: ["Excellent", "Very Good", "Good", "Average", "Poor"],
    abnormal_noise: ["yes", "no"],
    abnormal_noise_reason: ["NA", "Engine knock", "Belt noise", "Exhaust leak", "Other"],
    leakages_oil_coolant: ["no / no", "yes / no", "no / yes", "yes / yes"],
    level_oil_coolant: ["Above Minimum / Above Min", "Minimum / Minimum", "Below Min / Below Min", "Empty / Empty"],
    contamination_oil_coolant: ["no / no", "yes / no", "no / yes", "yes / yes"],
    misfiring: ["yes", "no"],
    coolant_condition: ["Excellent", "Good", "Average", "Poor"],
    exhaust_smoke_color: ["Normal", "White", "Blue", "Black"],
    over_heating: ["yes", "no"],
    fuel: ["yes", "no"],
    catalytic_converter_tail_pipe_condition: ["Excellent", "Good", "Average", "Poor"],
    exhaust_noise_leak_damage: ["Yes", "No"],
    refurb_cost: "number",
    remarks: ["good condition", "needs attention", "poor condition", "requires major repair"]
  },
  brakes: {
    effectiveness: ["Excellent", "Good", "Average", "Poor"],
    oil_level_leakage: ["MIN / no", "FULL / no", "MIN / yes", "FULL / yes", "EMPTY / no", "EMPTY / yes"],
    hand_brake_operation: ["Excellent", "Good", "Average", "Poor"],
    refurb_cost: "number",
    remarks: ["good condition", "needs attention", "poor condition", "requires major repair"]
  },
  electrical_system: {
    battery_condition: ["Excellent", "Good", "Average", "Poor"],
    starter_operation: ["Excellent", "Good", "Average", "Poor"],
    horn_operation: ["Excellent", "Good", "Average", "Poor"],
    radiator_condensor_fans: ["Excellent", "Good", "Average", "Poor"],
    all_warning_light_operation: ["yes", "no", "partial"],
    wipers_operation: ["Excellent", "Good", "Average", "Poor"],
    rear_defogger_system_functioning: ["Excellent", "Good", "Average", "Poor"],
    ac_blower_motor_operation: ["Excellent", "Good", "Average", "Poor"],
    lamps_head_fog_tail: ["Clear/Clear/clear", "Dim/Clear/clear", "Clear/Dim/clear", "Clear/Clear/dim", "Broken/Clear/clear"],
    turn_indicators: ["working", "not working", "partial"],
    outside_rear_view_mirrors: ["yes", "no", "damaged"],
    power_windows_operation: ["yes", "no", "partial"],
    music_system: ["yes", "no", "faulty"],
    cruise_control: ["yes", "no", "faulty"],
    pedal_shifting: ["Excellent", "Good", "Average", "Poor"],
    remote_tail_gate_opener: ["yes", "no", "faulty"],
    key_less_entry: ["yes", "no", "faulty"],
    reverse_parking_sensor_camera: ["yes", "no", "sensor only", "camera only", "faulty"],
    seat_positioning_adjustment: ["yes", "no", "manual only", "electric only", "partial"],
    retrofitted_music_system: ["Yes", "No"],
    retrofitted_central_locking: ["Yes", "No"],
    retrofitted_power_windows: ["Yes", "No"],
    retrofitted_ac: ["Yes", "No"],
    refurb_cost: "number",
    remarks: ["good condition", "needs attention", "poor condition", "requires major repair"]
  },
  suspension: {
    noise_while_driving: ["yes", "no"],
    oil_leakage: ["yes", "no"],
    body_sagging: ["yes", "no"],
    refurb_cost: "number",
    remarks: ["good condition", "needs attention", "poor condition", "requires major repair"]
  },
  steering: {
    steering_play: ["yes", "no"],
    noise_while_driving: ["yes", "no"],
    refurb_cost: "number",
    remarks: ["good condition", "needs attention", "poor condition", "requires major repair"]
  },
  tyres: {
    front_right: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"],
    front_left: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"],
    rear_right: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"],
    rear_left: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"],
    spare_tyre: ["0%", "10%", "20%", "30%", "40%", "50%", "60%", "70%", "80%", "90%", "100%"],
    refurb_cost: "number",
    remarks: ["Good condition", "needs replacement", "poor condition", "requires immediate replacement"]
  },
  interior: {
    stains_wornout_faded_torn_cracked: ["Excellent", "Good", "Average", "Poor"],
    refurb_cost: "number",
    remarks: ["good condition", "needs attention", "poor condition", "requires major repair"]
  },
  drive_train: {
    noise_while_driving: ["yes", "no"],
    gear_shifting: ["smooth", "rough", "hard", "slipping"],
    clutch_operation: ["smooth", "rough", "hard", "slipping"],
    drive_shaft_cut_on_boot_surface_cracks: ["Yes", "No"],
    wheel_bearing_noise_while_driving: ["Yes", "No"],
    refurb_cost: "number",
    remarks: ["good condition", "needs attention", "poor condition", "requires major repair"]
  },
  fuel_ignition_system: {
    ignition_system_coil_leakage: ["Yes", "No"],
    fuel_system_fuel_injection_pumps_lines_leakage: ["Yes", "No"],
    refurb_cost: "number",
    remarks: ["Good condition", "needs attention", "poor condition", "requires major repair"]
  },
  ac: {
    noise_from_ac_compressor_blower: ["Yes", "No", "NA"],
    ac_cooling: ["Excellent", "Good", "Average", "Poor", "Not Working"],
    refurb_cost: "number",
    remarks: ["good condition", "needs attention", "poor condition", "requires major repair"]
  },
  body: {
    front_bumper: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    back_bumper: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    bonnet: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    tail_gate: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    door_front_left: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    door_front_right: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    door_rear_left: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    door_rear_right: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    fender_front_left: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    fender_front_right: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    fender_rear_left: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    fender_rear_right: ["Excellent", "Good", "Average", "Poor", "Damaged"],
    front_light: ["excellent", "good", "average", "poor", "broken"],
    back_light: ["excellent", "good", "average", "poor", "broken"],
    window_shield: ["excellent", "good", "average", "poor", "cracked", "broken"],
    pillars: ["original", "repainted", "replaced", "damaged"],
    mirrors: ["excellent", "good", "faded", "cracked", "broken", "missing"],
    retrofitted_alloywheels: ["Yes", "No"],
    exterior_refurb_cost: "number",
    exterior_remarks: ["good condition", "needs attention", "poor condition", "requires major repair"]
  },
  inspection_details: {
    inspection_report_created_by: "string",
    certified_by_dealer: "string",
    evaluation_report_note: "string",
    date_of_evaluation: "string",
    das_autoinspekt_id: "string",
    page: ["Page-1", "Page-2", "Page-3"]
  }
}; 