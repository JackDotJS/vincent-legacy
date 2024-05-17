// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;

fn main() {
  // fixes rendering failure on linux with nvidia video cards
  // FIXME: this should be temporary!!!
  let key = "WEBKIT_DISABLE_DMABUF_RENDERER";
  env::set_var(key, "1");

  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
