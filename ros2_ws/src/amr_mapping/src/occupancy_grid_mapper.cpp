#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/laser_scan.hpp>
#include <nav_msgs/msg/occupancy_grid.hpp>
#include <nav_msgs/msg/odometry.hpp>
#include <cmath>
#include <vector>

class OccupancyGridMapperCPP : public rclcpp::Node {
public:
    OccupancyGridMapperCPP() : Node("occupancy_grid_mapper_cpp") {
        this->declare_parameter("resolution", 0.10);
        this->declare_parameter("width", 10.0);
        this->declare_parameter("height", 10.0);

        res_ = this->get_parameter("resolution").as_double();
        w_m_ = this->get_parameter("width").as_double();
        h_m_ = this->get_parameter("height").as_double();

        gw_ = static_cast<int>(w_m_ / res_);
        gh_ = static_cast<int>(h_m_ / res_);

        grid_data_.assign(gw_ * gh_, -1);

        odom_sub_ = this->create_subscription<nav_msgs::msg::Odometry>(
            "/odometry/filtered", 10, std::bind(&OccupancyGridMapperCPP::odomCallback, this, std::placeholders::_1));
        scan_sub_ = this->create_subscription<sensor_msgs::msg::LaserScan>(
            "/scan", 10, std::bind(&OccupancyGridMapperCPP::scanCallback, this, std::placeholders::_1));

        map_pub_ = this->create_publisher<nav_msgs::msg::OccupancyGrid>("/map", 10);

        RCLCPP_INFO(this->get_logger(), "C++ Occupancy Grid Mapper Node initialized.");
    }

private:
    void odomCallback(const nav_msgs::msg::Odometry::SharedPtr msg) {
        rx_ = msg->pose.pose.position.x;
        ry_ = msg->pose.pose.position.y;
        auto q = msg->pose.pose.orientation;
        double siny_cosp = 2.0 * (q.w * q.z + q.x * q.y);
        double cosy_cosp = 1.0 - 2.0 * (q.y * q.y + q.z * q.z);
        ryaw_ = std::atan2(siny_cosp, cosy_cosp);
    }

    void scanCallback(const sensor_msgs::msg::LaserScan::SharedPtr msg) {
        int r_gx = static_cast<int>(rx_ / res_);
        int r_gy = static_cast<int>(ry_ / res_);

        double angle = msg->angle_min;
        for (float r : msg->ranges) {
            if (r >= msg->range_min && r <= msg->range_max) {
                double b_angle = ryaw_ + angle;
                double wx = rx_ + r * std::cos(b_angle);
                double wy = ry_ + r * std::sin(b_angle);
                int gx = static_cast<int>(wx / res_);
                int gy = static_cast<int>(wy / res_);
                if (gx >= 0 && gx < gw_ && gy >= 0 && gy < gh_) {
                    grid_data_[gy * gw_ + gx] = 100;
                }
            }
            angle += msg->angle_increment;
        }

        publishMap();
    }

    void publishMap() {
        nav_msgs::msg::OccupancyGrid map_msg;
        map_msg.header.stamp = this->get_clock()->now();
        map_msg.header.frame_id = "map";
        map_msg.info.resolution = res_;
        map_msg.info.width = gw_;
        map_msg.info.height = gh_;
        map_msg.info.origin.position.x = 0.0;
        map_msg.info.origin.position.y = 0.0;
        map_msg.data = grid_data_;
        map_pub_->publish(map_msg);
    }

    double res_, w_m_, h_m_;
    int gw_, gh_;
    double rx_ = 1.0, ry_ = 1.0, ryaw_ = 0.0;
    std::vector<int8_t> grid_data_;
    rclcpp::Subscription<nav_msgs::msg::Odometry>::SharedPtr odom_sub_;
    rclcpp::Subscription<sensor_msgs::msg::LaserScan>::SharedPtr scan_sub_;
    rclcpp::Publisher<nav_msgs::msg::OccupancyGrid>::SharedPtr map_pub_;
};

int main(int argc, char ** argv) {
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<OccupancyGridMapperCPP>());
    rclcpp::shutdown();
    return 0;
}
