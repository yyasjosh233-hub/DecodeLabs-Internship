#include <rclcpp/rclcpp.hpp>
#include <sensor_msgs/msg/laser_scan.hpp>
#include <geometry_msgs/msg/twist.hpp>
#include <nav_msgs/msg/odometry.hpp>
#include <cmath>
#include <algorithm>

class DynamicObstacleAvoidanceCPP : public rclcpp::Node {
public:
    DynamicObstacleAvoidanceCPP() : Node("dynamic_obstacle_avoidance_cpp") {
        this->declare_parameter("max_speed", 0.8);
        this->declare_parameter("safe_distance", 0.6);
        this->declare_parameter("critical_distance", 0.3);

        max_speed_ = this->get_parameter("max_speed").as_double();
        safe_dist_ = this->get_parameter("safe_distance").as_double();
        crit_dist_ = this->get_parameter("critical_distance").as_double();

        scan_sub_ = this->create_subscription<sensor_msgs::msg::LaserScan>(
            "/scan", 10, std::bind(&DynamicObstacleAvoidanceCPP::scanCallback, this, std::placeholders::_1));
        cmd_pub_ = this->create_publisher<geometry_msgs::msg::Twist>("/cmd_vel", 10);

        RCLCPP_INFO(this->get_logger(), "C++ Dynamic Obstacle Avoidance Node initialized.");
    }

private:
    void scanCallback(const sensor_msgs::msg::LaserScan::SharedPtr msg) {
        float min_r = msg->range_max;
        for (float r : msg->ranges) {
            if (r >= msg->range_min && r <= msg->range_max) {
                if (r < min_r) min_r = r;
            }
        }

        geometry_msgs::msg::Twist cmd;
        if (min_r <= crit_dist_) {
            cmd.linear.x = 0.0;
            cmd.angular.z = 0.0;
        } else if (min_r <= safe_dist_) {
            double err = min_r - crit_dist_;
            cmd.linear.x = max_speed_ * std::tanh(std::max(0.0, err));
            cmd.angular.z = 0.3;
        } else {
            cmd.linear.x = max_speed_;
            cmd.angular.z = 0.0;
        }
        cmd_pub_->publish(cmd);
    }

    double max_speed_, safe_dist_, crit_dist_;
    rclcpp::Subscription<sensor_msgs::msg::LaserScan>::SharedPtr scan_sub_;
    rclcpp::Publisher<geometry_msgs::msg::Twist>::SharedPtr cmd_pub_;
};

int main(int argc, char ** argv) {
    rclcpp::init(argc, argv);
    rclcpp::spin(std::make_shared<DynamicObstacleAvoidanceCPP>());
    rclcpp::shutdown();
    return 0;
}
