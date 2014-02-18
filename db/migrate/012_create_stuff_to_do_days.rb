class CreateStuffToDoDays < ActiveRecord::Migration
  def change
    create_table :stuff_to_do_days do |t|
      t.references :user
      t.date :scheduled_on
      t.integer :position
      t.integer :stuff_id
      t.string :stuff_type
    end

    add_index :stuff_to_do_days, :scheduled_on
    add_index :stuff_to_do_days, [:scheduled_on, :user_id]
    add_index :stuff_to_do_days, [:stuff_id, :stuff_type]
  end
end
