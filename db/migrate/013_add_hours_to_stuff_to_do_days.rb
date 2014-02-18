class AddHoursToStuffToDoDays < ActiveRecord::Migration
  def change
     add_column :stuff_to_do_days, :hours, :float
  end
end
